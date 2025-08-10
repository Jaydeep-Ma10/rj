import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prisma/client.js';
import { logger } from '../utils/logger.js';
import { logAuthEvent, AUDIT_ACTIONS, AUDIT_STATUS } from './auditService.js';

// Security configuration
const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  LOCKOUT_DURATION_MINUTES: parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30,
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
};

// Validate JWT secret on startup
if (!AUTH_CONFIG.JWT_SECRET || AUTH_CONFIG.JWT_SECRET === 'changeme_secret' || AUTH_CONFIG.JWT_SECRET === 'your-secret') {
  throw new Error('JWT_SECRET must be set to a secure value in production');
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload, expiresIn = AUTH_CONFIG.JWT_EXPIRES_IN) {
  return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, { expiresIn });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, AUTH_CONFIG.JWT_REFRESH_SECRET, { 
    expiresIn: AUTH_CONFIG.JWT_REFRESH_EXPIRES_IN 
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, AUTH_CONFIG.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, AUTH_CONFIG.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Check if user account is locked
 */
export async function isAccountLocked(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true, loginAttempts: true }
  });

  if (!user) return false;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true;
  }

  // Reset lock if expired
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: null,
        loginAttempts: 0
      }
    });
  }

  return false;
}

/**
 * Increment login attempts and lock account if needed
 */
export async function handleFailedLogin(userId, req) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true, name: true }
  });

  if (!user) return;

  const newAttempts = user.loginAttempts + 1;
  const updateData = { loginAttempts: newAttempts };

  // Lock account if max attempts reached
  if (newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + AUTH_CONFIG.LOCKOUT_DURATION_MINUTES);
    updateData.lockedUntil = lockUntil;

    // Log account lockout
    await logAuthEvent(
      AUDIT_ACTIONS.ACCOUNT_LOCKED,
      AUDIT_STATUS.SUCCESS,
      userId,
      req,
      `Account locked after ${newAttempts} failed attempts`
    );

    logger.warn('Account locked due to failed login attempts', {
      userId,
      username: user.name,
      attempts: newAttempts,
      lockUntil: lockUntil.toISOString()
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
}

/**
 * Reset login attempts on successful login
 */
export async function handleSuccessfulLogin(userId, req) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
      lastActive: new Date()
    }
  });

  await logAuthEvent(
    AUDIT_ACTIONS.LOGIN,
    AUDIT_STATUS.SUCCESS,
    userId,
    req
  );
}

/**
 * Create user session
 */
export async function createUserSession(userId, token, req) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  return prisma.userSession.create({
    data: {
      userId,
      token: crypto.createHash('sha256').update(token).digest('hex'),
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      expiresAt
    }
  });
}

/**
 * Validate user session
 */
export async function validateUserSession(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const session = await prisma.userSession.findUnique({
    where: { token: hashedToken },
    include: { user: true }
  });

  if (!session || !session.isActive || session.expiresAt < new Date()) {
    return null;
  }

  // Update last used timestamp
  await prisma.userSession.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() }
  });

  return session;
}

/**
 * Revoke user session
 */
export async function revokeUserSession(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return prisma.userSession.update({
    where: { token: hashedToken },
    data: { isActive: false }
  });
}

/**
 * Revoke all user sessions
 */
export async function revokeAllUserSessions(userId) {
  return prisma.userSession.updateMany({
    where: { userId },
    data: { isActive: false }
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  const deleted = await prisma.userSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isActive: false }
      ]
    }
  });

  logger.info('Cleaned up expired sessions', { deletedCount: deleted.count });
  return deleted.count;
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
}

/**
 * Calculate password strength score
 */
function calculatePasswordStrength(password) {
  let score = 0;
  
  // Length bonus
  score += Math.min(password.length * 2, 20);
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/[0-9]/.test(password)) score += 5;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
  
  // Normalize to 0-100 scale
  score = Math.max(0, Math.min(100, score));
  
  if (score < 30) return 'weak';
  if (score < 60) return 'medium';
  if (score < 80) return 'strong';
  return 'very_strong';
}

/**
 * Generate secure referral code
 */
export function generateReferralCode(length = 8) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return code;
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to require admin authentication
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid admin token attempt', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
