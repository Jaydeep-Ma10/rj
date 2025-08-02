import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { sendOTPSMS, validateMobileNumber } from '../utils/smsService.js';

const prisma = new PrismaClient();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/password-reset/request-otp
export const requestPasswordResetOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile } = req.body;

    // Validate mobile number format
    const mobileValidation = validateMobileNumber(mobile);
    if (!mobileValidation.valid) {
      return res.status(400).json({ error: mobileValidation.error });
    }

    // Check if user exists with this mobile number
    const user = await prisma.user.findFirst({
      where: { mobile }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this mobile number' });
    }

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await prisma.passwordReset.findFirst({
      where: {
        mobile,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        }
      }
    });

    if (recentOTP) {
      return res.status(429).json({ 
        error: 'Please wait 2 minutes before requesting another OTP' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to database
    await prisma.passwordReset.create({
      data: {
        mobile,
        otp,
        expiresAt,
        userId: user.id
      }
    });

    // Send OTP via SMS
    try {
      await sendOTPSMS(mobile, otp);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }

    console.log(`🔐 Password reset OTP generated for mobile: ${mobile}`);
    
    res.json({ 
      message: 'OTP sent successfully to your mobile number',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// POST /api/password-reset/verify-otp
export const verifyPasswordResetOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile, otp } = req.body;

    // Find valid OTP
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        mobile,
        otp,
        isUsed: false,
        expiresAt: {
          gte: new Date() // Not expired
        }
      },
      include: {
        user: true
      }
    });

    if (!passwordReset) {
      return res.status(400).json({ 
        error: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    // Generate temporary reset token (valid for 15 minutes)
    const resetToken = generateOTP() + generateOTP(); // 12-digit token
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update the password reset record with reset token
    await prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: {
        isUsed: true, // Mark OTP as used
        otp: resetToken, // Store reset token
        expiresAt: tokenExpiresAt
      }
    });

    console.log(`✅ OTP verified for mobile: ${mobile}`);

    res.json({
      message: 'OTP verified successfully',
      resetToken,
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// POST /api/password-reset/reset-password
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile, resetToken, newPassword } = req.body;

    // Find valid reset token
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        mobile,
        otp: resetToken, // resetToken is stored in otp field
        isUsed: true, // OTP was used, now using as reset token
        expiresAt: {
          gte: new Date() // Not expired
        }
      },
      include: {
        user: true
      }
    });

    if (!passwordReset || !passwordReset.user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please start the process again.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: passwordReset.user.id },
      data: { password: hashedPassword }
    });

    // Invalidate the reset token by updating expiry
    await prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: {
        expiresAt: new Date() // Set to current time to expire it
      }
    });

    // Clean up old password reset records for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: passwordReset.user.id,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`🔒 Password reset successful for user: ${passwordReset.user.name} (mobile: ${mobile})`);

    res.json({
      message: 'Password reset successful. You can now login with your new password.',
      user: {
        id: passwordReset.user.id,
        name: passwordReset.user.name,
        mobile: passwordReset.user.mobile
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Validation middleware
export const validateRequestOTP = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10-15 digits')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid mobile number format')
];

export const validateVerifyOTP = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

export const validateResetPassword = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required'),
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 12, max: 12 })
    .withMessage('Invalid reset token'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage('Password must contain at least one letter and one number')
];
