import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendOTPSMS, validateMobileNumber } from '../utils/smsService.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

// Security configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RESET_TOKEN_BYTES: 32,
  RESET_TOKEN_EXPIRY_HOURS: 1,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 5
};

// Generate a secure random token
function generateSecureToken() {
  return crypto.randomBytes(OTP_CONFIG.RESET_TOKEN_BYTES).toString('hex');
}

// Sanitize mobile number
function sanitizeMobileNumber(mobile) {
  return mobile.replace(/[^0-9+]/g, '');
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/password-reset/request-otp
export const requestPasswordResetOTP = async (req, res) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const sanitizedMobile = req.body.mobile ? sanitizeMobileNumber(req.body.mobile) : '';
  
  // Log the request
  logger.info('Password reset OTP request', {
    requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    mobile: sanitizedMobile ? `${sanitizedMobile.substring(0, 3)}****${sanitizedMobile.slice(-3)}` : 'invalid',
    timestamp: new Date().toISOString()
  });

  try {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed', { 
        requestId, 
        errors: errors.array(),
        validationTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Sanitize and validate mobile number
    const mobile = sanitizedMobile;
    const mobileValidation = validateMobileNumber(mobile);
    if (!mobileValidation.valid) {
      logger.warn('Invalid mobile number', { requestId, mobile });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid mobile number format' 
      });
    }

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await prisma.passwordReset.findFirst({
      where: {
        mobile,
        createdAt: { gte: new Date(Date.now() - OTP_CONFIG.RATE_LIMIT_WINDOW_MS) },
        isUsed: false
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true }
    });

    if (recentOTP) {
      const timeLeft = Math.ceil((recentOTP.createdAt.getTime() + OTP_CONFIG.RATE_LIMIT_WINDOW_MS - Date.now()) / 1000);
      logger.warn('Rate limit exceeded', { 
        requestId, 
        mobile: `${mobile.substring(0, 3)}****${mobile.slice(-3)}`,
        timeLeft: `${timeLeft}s`
      });
      
      return res.status(429).json({ 
        success: false,
        error: `Please wait ${timeLeft} seconds before requesting another OTP`,
        retryAfter: timeLeft
      });
    }

    // Find user by mobile
    const user = await prisma.user.findFirst({
      where: { mobile },
      select: { id: true, name: true, mobile: true, isActive: true }
    });

    if (!user) {
      logger.warn('User not found', { requestId, mobile: `${mobile.substring(0, 3)}****${mobile.slice(-3)}` });
      return res.status(404).json({ 
        success: false, 
        error: 'No account found with this mobile number' 
      });
    }

    if (!user.isActive) {
      logger.warn('Account inactive', { requestId, userId: user.id });
      return res.status(403).json({ 
        success: false, 
        error: 'This account has been deactivated' 
      });
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Start transaction to ensure data consistency
    await prisma.$transaction([
      // Invalidate any existing OTPs for this mobile
      prisma.passwordReset.updateMany({
        where: { 
          mobile,
          isUsed: false,
          expiresAt: { gt: new Date() }
        },
        data: { 
          isUsed: true,
          updatedAt: new Date()
        }
      }),
      
      // Create new OTP
      prisma.passwordReset.create({
        data: {
          mobile,
          otp: hashedOtp,
          expiresAt,
          userId: user.id,
          requestIp: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            requestId,
            deviceInfo: req.get('user-agent'),
            ipAddress: req.ip
          }
        }
      })
    ]);

    // Send OTP via SMS (non-blocking)
    sendOTPSMS(mobile, otp)
      .then(result => {
        logger.info('OTP sent successfully', { 
          requestId, 
          userId: user.id,
          provider: result.provider,
          messageId: result.messageId
        });
      })
      .catch(error => {
        logger.error('Failed to send OTP', { 
          requestId, 
          userId: user.id,
          error: error.message,
          stack: error.stack
        });
      });

    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log successful OTP generation
    logger.info('OTP generated successfully', {
      requestId,
      userId: user.id,
      mobile: `${mobile.substring(0, 3)}****${mobile.slice(-3)}`,
      expiresAt: expiresAt.toISOString(),
      responseTime: `${responseTime}ms`
    });
    
    // Return success response (don't expose OTP in response)
    res.json({ 
      success: true,
      message: 'OTP has been sent to your mobile number',
      expiresIn: `${OTP_CONFIG.EXPIRY_MINUTES} minutes`,
      requestId
    });

  } catch (error) {
    // Log the error
    logger.error('Error in requestPasswordResetOTP', {
      requestId,
      error: error.message,
      stack: error.stack,
      responseTime: `${Date.now() - startTime}ms`
    });
    
    // Return generic error message
    res.status(500).json({ 
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      requestId
    });
  }
};

// POST /api/password-reset/verify-otp
export const verifyPasswordResetOTP = async (req, res) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { mobile: rawMobile, otp } = req.body;
  const sanitizedMobile = rawMobile ? sanitizeMobileNumber(rawMobile) : '';
  
  // Log the verification attempt
  logger.info('Password reset OTP verification attempt', {
    requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    mobile: sanitizedMobile ? `${sanitizedMobile.substring(0, 3)}****${sanitizedMobile.slice(-3)}` : 'invalid',
    timestamp: new Date().toISOString()
  });

  try {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('OTP verification validation failed', { 
        requestId, 
        errors: errors.array(),
        validationTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Sanitize and validate mobile number
    const mobile = sanitizedMobile;
    const mobileValidation = validateMobileNumber(mobile);
    if (!mobileValidation.valid) {
      logger.warn('Invalid mobile number format during OTP verification', { 
        requestId, 
        mobile 
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid mobile number format' 
      });
    }

    // Find the most recent valid OTP for this mobile
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        mobile,
        isUsed: false,
        expiresAt: { gte: new Date() }, // Not expired
        createdAt: { 
          gte: new Date(Date.now() - OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000) // Within expiry window
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Check if OTP exists and is valid
    if (!passwordReset) {
      logger.warn('No valid OTP found', { 
        requestId, 
        mobile: `${mobile.substring(0, 3)}****${mobile.slice(-3)}` 
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired OTP' 
      });
    }

    // Verify the OTP using timing-safe comparison
    const isOtpValid = await bcrypt.compare(otp, passwordReset.otp);
    if (!isOtpValid) {
      // Log failed attempt
      logger.warn('Invalid OTP provided', { 
        requestId, 
        userId: passwordReset.userId,
        mobile: `${mobile.substring(0, 3)}****${mobile.slice(-3)}`
      });
      
      // Increment failed attempts
      await prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { 
          failedAttempts: { increment: 1 },
          lastFailedAttempt: new Date()
        }
      });
      
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid OTP' 
      });
    }

    // Check if user is active
    if (!passwordReset.user?.isActive) {
      logger.warn('Account is inactive during OTP verification', { 
        requestId, 
        userId: passwordReset.userId 
      });
      return res.status(403).json({ 
        success: false, 
        error: 'This account has been deactivated' 
      });
    }

    // Generate a secure reset token
    const resetToken = generateSecureToken();
    const tokenExpiresAt = new Date(Date.now() + OTP_CONFIG.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Update the password reset record with reset token
    await prisma.$transaction([
      // Mark all previous tokens for this user as used
      prisma.passwordReset.updateMany({
        where: { 
          userId: passwordReset.userId,
          isUsed: false,
          expiresAt: { gte: new Date() }
        },
        data: { 
          isUsed: true,
          updatedAt: new Date()
        }
      }),
      
      // Create new reset token
      prisma.passwordReset.create({
        data: {
          mobile,
          otp: hashedToken, // Store hashed reset token
          isUsed: false,    // Token will be used in the next step
          expiresAt: tokenExpiresAt,
          userId: passwordReset.userId,
          requestIp: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            requestId,
            type: 'password_reset_token',
            deviceInfo: req.get('user-agent'),
            ipAddress: req.ip
          }
        }
      })
    ]);

    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log successful OTP verification
    logger.info('OTP verified successfully', {
      requestId,
      userId: passwordReset.userId,
      mobile: `${mobile.substring(0, 3)}****${mobile.slice(-3)}`,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      responseTime: `${responseTime}ms`
    });
    
    // Return success response with reset token
    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
      expiresIn: `${OTP_CONFIG.RESET_TOKEN_EXPIRY_HOURS} hours`,
      requestId
    });

  } catch (error) {
    // Log the error
    logger.error('Error in verifyPasswordResetOTP', {
      requestId,
      error: error.message,
      stack: error.stack,
      responseTime: `${Date.now() - startTime}ms`
    });
    
    // Return generic error message
    res.status(500).json({ 
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      requestId
    });
  }
};

// POST /api/password-reset/reset-password
export const resetPassword = async (req, res) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { resetToken, newPassword } = req.body;
  
  // Log the password reset attempt
  logger.info('Password reset attempt', {
    requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });

  try {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Password reset validation failed', { 
        requestId, 
        errors: errors.array(),
        validationTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Find valid reset token
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        isUsed: false,
        expiresAt: { gte: new Date() }, // Not expired
        metadata: {
          path: ['type'],
          equals: 'password_reset_token'
        },
        createdAt: { 
          gte: new Date(Date.now() - OTP_CONFIG.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobile: true,
            isActive: true,
            password: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Verify the reset token using timing-safe comparison
    const isTokenValid = passwordReset && 
      await bcrypt.compare(resetToken, passwordReset.otp);

    if (!isTokenValid || !passwordReset?.user) {
      logger.warn('Invalid or expired reset token', { requestId });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Check if user is active
    if (!passwordReset.user.isActive) {
      logger.warn('Account is inactive during password reset', { 
        requestId, 
        userId: passwordReset.userId 
      });
      return res.status(403).json({ 
        success: false, 
        error: 'This account has been deactivated' 
      });
    }

    // Check if new password is different from current password (if available)
    if (passwordReset.user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, passwordReset.user.password);
      if (isSamePassword) {
        logger.warn('New password cannot be the same as current password', { 
          requestId, 
          userId: passwordReset.userId 
        });
        return res.status(400).json({ 
          success: false, 
          error: 'New password must be different from your current password' 
        });
      }
    }

    // Hash the new password with increased cost factor for better security
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Start transaction to ensure data consistency
    await prisma.$transaction([
      // Update user's password
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { 
          password: hashedPassword,
          lastPasswordChange: new Date()
        }
      }),
      
      // Mark the reset token as used
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { 
          isUsed: true,
          updatedAt: new Date()
        }
      })
    ]);

    // Log successful password reset
    logger.info('Password reset successful', {
      requestId,
      userId: passwordReset.userId,
      mobile: passwordReset.user.mobile ? 
        `${passwordReset.user.mobile.substring(0, 3)}****${passwordReset.user.mobile.slice(-3)}` : 'N/A',
      email: passwordReset.user.email ? 
        passwordReset.user.email.replace(/^(.{3})[^@]*/, (match, p1) => p1 + '*****') : 'N/A',
      resetAt: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
    
    // Return success response
    res.json({ 
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      requestId
    });

  } catch (error) {
    // Log the error
    logger.error('Error in resetPassword', {
      requestId,
      error: error.message,
      stack: error.stack,
      responseTime: `${Date.now() - startTime}ms`
    });
    
    // Return generic error message
    res.status(500).json({ 
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      requestId
    });
  }
};

// Validation middleware
export const validateRequestOTP = [
  body('mobile')
    .notEmpty().withMessage('Mobile number is required')
    .isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number format')
    .trim()
    .escape()
    .customSanitizer(value => {
      // Remove all non-digit characters except leading +
      const sanitized = value.replace(/[^\d+]/g, '');
      // Ensure it starts with a country code
      return sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
    })
    .isLength({ min: 8, max: 15 }).withMessage('Mobile number must be between 8 and 15 digits')
];

export const validateVerifyOTP = [
  body('mobile')
    .notEmpty().withMessage('Mobile number is required')
    .isMobilePhone('any', { strictMode: false }).withMessage('Invalid mobile number format')
    .trim()
    .escape(),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
    .trim()
];

export const validateResetPassword = [
  body('resetToken')
    .notEmpty().withMessage('Reset token is required')
    .isString().withMessage('Invalid reset token format')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token length')
    .trim(),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 12 }).withMessage('Password must be at least 12 characters long')
    .isLength({ max: 100 }).withMessage('Password cannot exceed 100 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter (A-Z)')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter (a-z)')
    .matches(/[0-9]/).withMessage('Password must contain at least one number (0-9)')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character (!@#$%^&*)')
    // Common password check (add more to the list as needed)
    .custom(value => {
      const commonPasswords = [
        'password', '12345678', 'qwerty', '123456789', '12345',
        '1234567890', '1234567', 'password1', '123123', '111111'
      ];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('This password is too common. Please choose a stronger one.');
      }
      return true;
    })
    // Check for sequential characters (e.g., 1234, abcd)
    .custom(value => {
      const sequentialRegex = /(?:123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
      if (sequentialRegex.test(value)) {
        throw new Error('Password contains sequential characters which are easy to guess');
      }
      return true;
    })
    // Check for repeated characters (e.g., aaaa, 1111)
    .custom(value => {
      const repeatRegex = /(.)\1{3,}/;
      if (repeatRegex.test(value)) {
        throw new Error('Password contains too many repeated characters');
      }
      return true;
    })
    .custom((value, { req }) => {
      // Check if password contains username/email (if available in request)
      if (req.body.email && value.toLowerCase().includes(req.body.email.split('@')[0].toLowerCase())) {
        throw new Error('Password should not contain your email');
      }
      if (req.body.mobile && value.includes(req.body.mobile.replace(/\D/g, ''))) {
        throw new Error('Password should not contain your mobile number');
      }
      return true;
    })
];
