import rateLimit from 'express-rate-limit';
import { prisma } from '../prisma/client.js';
import { logger } from '../utils/logger.js';
import { logSecurityEvent, AUDIT_ACTIONS, AUDIT_STATUS } from './auditService.js';

// Rate limit configurations
const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts, please try again later'
  },
  
  SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 signups per hour per IP
    message: 'Too many signup attempts, please try again later'
  },
  
  PASSWORD_RESET: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 OTP requests per window
    message: 'Too many password reset attempts, please try again later'
  },
  
  // Gaming endpoints
  BET_PLACEMENT: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 bets per minute
    message: 'Too many bets placed, please slow down'
  },
  
  // Financial endpoints
  DEPOSIT_REQUEST: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 deposit requests per hour
    message: 'Too many deposit requests, please try again later'
  },
  
  WITHDRAW_REQUEST: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 withdrawal requests per hour
    message: 'Too many withdrawal requests, please try again later'
  },
  
  // API endpoints
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
  }
};

/**
 * Create rate limiter with custom configuration
 */
function createRateLimiter(config, identifier = 'ip') {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { error: config.message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      switch (identifier) {
        case 'user':
          return req.user?.id?.toString() || req.ip;
        case 'mobile':
          return req.body?.mobile || req.ip;
        default:
          return req.ip;
      }
    },
    handler: async (req, res) => {
      const key = req.ip;
      const userId = req.user?.id;
      
      // Log rate limit exceeded event
      await logSecurityEvent(
        AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
        AUDIT_STATUS.SUCCESS,
        userId,
        req,
        {
          endpoint: req.path,
          method: req.method,
          limit: config.max,
          window: config.windowMs
        }
      );

      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userId,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('user-agent')
      });

      res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }
  });
}

/**
 * Database-based rate limiting for more complex scenarios
 */
export async function checkDatabaseRateLimit(identifier, action, windowMs, maxAttempts) {
  try {
    const windowStart = new Date(Date.now() - windowMs);
    
    // Clean up expired entries first
    await prisma.rateLimit.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    // Check current count
    const existingEntry = await prisma.rateLimit.findUnique({
      where: {
        identifier_action_windowStart: {
          identifier,
          action,
          windowStart
        }
      }
    });

    if (existingEntry) {
      if (existingEntry.count >= maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: existingEntry.expiresAt
        };
      }

      // Increment count
      const updated = await prisma.rateLimit.update({
        where: { id: existingEntry.id },
        data: { count: { increment: 1 } }
      });

      return {
        allowed: true,
        remaining: maxAttempts - updated.count,
        resetTime: updated.expiresAt
      };
    } else {
      // Create new entry
      const expiresAt = new Date(Date.now() + windowMs);
      
      await prisma.rateLimit.create({
        data: {
          identifier,
          action,
          count: 1,
          windowStart,
          expiresAt
        }
      });

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: expiresAt
      };
    }
  } catch (error) {
    logger.error('Database rate limit check failed', {
      error: error.message,
      identifier,
      action
    });
    
    // On error, allow the request to prevent blocking legitimate users
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: new Date(Date.now() + windowMs)
    };
  }
}

/**
 * Middleware for database-based rate limiting
 */
export function createDatabaseRateLimit(action, windowMs, maxAttempts, identifierType = 'ip') {
  return async (req, res, next) => {
    let identifier;
    
    switch (identifierType) {
      case 'user':
        identifier = req.user?.id?.toString() || req.ip;
        break;
      case 'mobile':
        identifier = req.body?.mobile || req.ip;
        break;
      default:
        identifier = req.ip;
    }

    const result = await checkDatabaseRateLimit(identifier, action, windowMs, maxAttempts);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxAttempts.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString()
    });

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000);
      
      // Log rate limit exceeded
      await logSecurityEvent(
        AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
        AUDIT_STATUS.SUCCESS,
        req.user?.id,
        req,
        {
          action,
          identifier: identifierType,
          limit: maxAttempts,
          window: windowMs
        }
      );

      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter
      });
    }

    next();
  };
}

// Export pre-configured rate limiters
export const rateLimiters = {
  // Authentication
  login: createRateLimiter(RATE_LIMITS.LOGIN),
  signup: createRateLimiter(RATE_LIMITS.SIGNUP),
  passwordReset: createRateLimiter(RATE_LIMITS.PASSWORD_RESET, 'mobile'),
  
  // Gaming
  betPlacement: createRateLimiter(RATE_LIMITS.BET_PLACEMENT, 'user'),
  
  // Financial
  depositRequest: createRateLimiter(RATE_LIMITS.DEPOSIT_REQUEST, 'user'),
  withdrawRequest: createRateLimiter(RATE_LIMITS.WITHDRAW_REQUEST, 'user'),
  
  // General API
  apiGeneral: createRateLimiter(RATE_LIMITS.API_GENERAL)
};

// Database-based rate limiters for complex scenarios
export const databaseRateLimiters = {
  // OTP requests per mobile number
  otpRequest: createDatabaseRateLimit('otp_request', 15 * 60 * 1000, 3, 'mobile'),
  
  // Betting per user
  userBetting: createDatabaseRateLimit('bet_placement', 60 * 1000, 10, 'user'),
  
  // Financial requests per user
  userDeposit: createDatabaseRateLimit('deposit_request', 60 * 60 * 1000, 5, 'user'),
  userWithdraw: createDatabaseRateLimit('withdraw_request', 60 * 60 * 1000, 3, 'user')
};

/**
 * Clean up expired rate limit entries
 */
export async function cleanupExpiredRateLimits() {
  try {
    const deleted = await prisma.rateLimit.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    logger.info('Cleaned up expired rate limit entries', { 
      deletedCount: deleted.count 
    });
    
    return deleted.count;
  } catch (error) {
    logger.error('Failed to cleanup expired rate limits', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Get rate limit status for debugging
 */
export async function getRateLimitStatus(identifier, action) {
  try {
    const entry = await prisma.rateLimit.findFirst({
      where: {
        identifier,
        action,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return entry ? {
      count: entry.count,
      windowStart: entry.windowStart,
      expiresAt: entry.expiresAt
    } : null;
  } catch (error) {
    logger.error('Failed to get rate limit status', {
      error: error.message,
      identifier,
      action
    });
    return null;
  }
}
