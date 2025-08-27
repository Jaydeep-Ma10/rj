import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { 
        ip: req.ip, 
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      res.status(429).json({ success: false, error: message });
    }
  });
};

// Authentication rate limiting
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts. Please try again later.'
);

// General API rate limiting
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests. Please try again later.'
);

// Betting rate limiting
export const bettingRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 bets per minute
  'Too many betting attempts. Please slow down.'
);

// File upload rate limiting
export const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads. Please try again later.'
);

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Socket.IO compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS patterns
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors', { 
      errors: errors.array(), 
      ip: req.ip,
      path: req.path 
    });
    
    return res.status(400).json({
      success: false,
      error: 'Invalid input data',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Common validation rules
export const validateAuth = [
  body('mobile')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid mobile number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be 10-15 digits'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be 6-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase, uppercase, and number'),
  handleValidationErrors
];

export const validateSignup = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  ...validateAuth
];

export const validateBet = [
  body('amount')
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Bet amount must be between 1 and 100000'),
  body('type')
    .isIn(['color', 'number', 'bigsmall', 'random'])
    .withMessage('Invalid bet type'),
  body('value')
    .custom((value, { req }) => {
      const { type } = req.body;
      if (type === 'color' && !['red', 'green', 'violet'].includes(value)) {
        throw new Error('Invalid color value');
      }
      if (type === 'number' && (!/^\d$/.test(value) || parseInt(value) < 0 || parseInt(value) > 9)) {
        throw new Error('Invalid number value');
      }
      if (type === 'bigsmall' && !['big', 'small'].includes(value)) {
        throw new Error('Invalid big/small value');
      }
      if (type === 'random' && value !== 'random') {
        throw new Error('Invalid random value');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateDeposit = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Name can only contain letters, numbers, and spaces'),
  body('mobile')
    .optional({ checkFalsy: true })
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid mobile number'),
  body('amount')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Amount must be between 1 and 1000000'),
  body('utr')
    .isLength({ min: 5, max: 50 })
    .withMessage('UTR must be 5-50 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('UTR can only contain letters and numbers'),
  handleValidationErrors
];
