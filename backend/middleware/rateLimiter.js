import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

/**
 * Format rate limit error response consistently
 */
const rateLimitResponse = (req, res, message) => {
  logger.warn(`Rate limit exceeded: ${message} - IP: ${req.ip} - Path: ${req.path}`);
  
  return res.status(429).json({
    success: false,
    error: 'Rate limit exceeded',
    message,
    status: 429
  });
};

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message, options = {}) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return rateLimitResponse(req, res, message);
    },
    ...options
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again after 15 minutes',
  {
    keyGenerator: (req) => req.ip,
    skip: (req) => req.path === '/api/health' // Skip health checks
  }
);

// Stricter rate limiting for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many login attempts, please try again later',
  {
    keyGenerator: (req) => {
      return req.body?.mobile ? `${req.ip}:${req.body.mobile}` : req.ip;
    }
  }
);

export { apiLimiter, authLimiter, createRateLimiter };
