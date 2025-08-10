import { logger } from './logger.js';

// Standard error response format
export const createErrorResponse = (message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) => {
  return {
    success: false,
    error: message,
    code,
    details,
    timestamp: new Date().toISOString()
  };
};

// Enhanced error logging with context
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
    timestamp: new Date().toISOString()
  };

  // Log different error types with appropriate levels
  if (error.name === 'ValidationError' || error.name === 'PrismaClientValidationError') {
    logger.warn('Validation error', errorInfo);
  } else if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      logger.warn('Unique constraint violation', errorInfo);
    } else if (error.code === 'P2025') {
      logger.warn('Record not found', errorInfo);
    } else {
      logger.error('Database error', errorInfo);
    }
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    logger.warn('Authentication error', errorInfo);
  } else if (error.name === 'MulterError') {
    logger.warn('File upload error', errorInfo);
  } else {
    logger.error('Unhandled error', errorInfo);
  }

  return errorInfo;
};

// Async error wrapper for controllers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;
    req.requestId = requestId;
    
    Promise.resolve(fn(req, res, next)).catch((error) => {
      const context = {
        requestId,
        userId: req.user?.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
      };
      
      logError(error, context);
      
      // Send appropriate error response based on error type
      let statusCode = 500;
      let message = 'An unexpected error occurred. Please try again later.';
      let code = 'INTERNAL_ERROR';
      
      if (error.name === 'ValidationError' || error.name === 'PrismaClientValidationError') {
        statusCode = 400;
        message = 'Invalid input data';
        code = 'VALIDATION_ERROR';
      } else if (error.name === 'PrismaClientKnownRequestError') {
        if (error.code === 'P2002') {
          statusCode = 409;
          message = 'Resource already exists';
          code = 'DUPLICATE_ERROR';
        } else if (error.code === 'P2025') {
          statusCode = 404;
          message = 'Resource not found';
          code = 'NOT_FOUND';
        }
      } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
        code = 'AUTH_ERROR';
      } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';
        code = 'TOKEN_EXPIRED';
      } else if (error.name === 'MulterError') {
        statusCode = 400;
        if (error.code === 'LIMIT_FILE_SIZE') {
          message = 'File size too large';
          code = 'FILE_TOO_LARGE';
        } else if (error.code === 'LIMIT_FILE_COUNT') {
          message = 'Too many files';
          code = 'TOO_MANY_FILES';
        } else {
          message = 'File upload error';
          code = 'UPLOAD_ERROR';
        }
      }
      
      res.status(statusCode).json(createErrorResponse(message, code, statusCode, {
        requestId
      }));
    });
  };
};

// Input validation helper
export const validateRequired = (fields, data) => {
  const missing = [];
  const invalid = [];
  
  for (const field of fields) {
    if (typeof field === 'string') {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    } else if (typeof field === 'object') {
      const { name, type, min, max, pattern } = field;
      const value = data[name];
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missing.push(name);
        continue;
      }
      
      // Type validation
      if (type === 'number' && isNaN(Number(value))) {
        invalid.push(`${name} must be a number`);
      } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        invalid.push(`${name} must be a valid email`);
      } else if (type === 'mobile' && !/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
        invalid.push(`${name} must be a valid mobile number`);
      }
      
      // Length validation
      if (min && value.length < min) {
        invalid.push(`${name} must be at least ${min} characters`);
      }
      if (max && value.length > max) {
        invalid.push(`${name} must not exceed ${max} characters`);
      }
      
      // Pattern validation
      if (pattern && !pattern.test(value)) {
        invalid.push(`${name} format is invalid`);
      }
    }
  }
  
  if (missing.length > 0 || invalid.length > 0) {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.details = { missing, invalid };
    throw error;
  }
};

// Rate limiting error
export const createRateLimitError = (retryAfter = 60) => {
  const error = new Error('Too many requests. Please try again later.');
  error.name = 'RateLimitError';
  error.retryAfter = retryAfter;
  return error;
};

// Database connection error handler
export const handleDatabaseError = (error) => {
  if (error.code === 'P1001') {
    logger.error('Database connection failed', { error: error.message });
    throw new Error('Database service unavailable');
  } else if (error.code === 'P1008') {
    logger.error('Database timeout', { error: error.message });
    throw new Error('Database operation timed out');
  }
  throw error;
};

// Security error handlers
export const createSecurityError = (type, details = {}) => {
  const errors = {
    INVALID_TOKEN: 'Invalid authentication token',
    EXPIRED_TOKEN: 'Authentication token expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    ACCOUNT_LOCKED: 'Account has been locked',
    SUSPICIOUS_ACTIVITY: 'Suspicious activity detected',
    INVALID_CREDENTIALS: 'Invalid credentials'
  };
  
  const error = new Error(errors[type] || 'Security error');
  error.name = 'SecurityError';
  error.type = type;
  error.details = details;
  return error;
};
