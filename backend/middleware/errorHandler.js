import { logger } from '../utils/logger.js';

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Rate limit errors are already handled by the rate limiter middleware
  if (err.status === 429) {
    return next(err);
  }

  // Log the full error details for debugging
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    errorCode: err.code,
    errorName: err.name
  });

  // Default error response
  let statusCode = err.status || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.code || 'INTERNAL_ERROR';
  let retryAfter = null;

  // Handle specific error types
  switch (true) {
    case err.name === 'ValidationError':
      statusCode = 400;
      message = 'Invalid input data';
      errorCode = 'VALIDATION_ERROR';
      break;
    case err.name === 'UnauthorizedError':
    case err.name === 'JsonWebTokenError':
      statusCode = 401;
      message = 'Authentication failed';
      errorCode = 'UNAUTHORIZED';
      break;
    case err.name === 'ForbiddenError':
      statusCode = 403;
      message = 'Access denied';
      errorCode = 'FORBIDDEN';
      break;
    case err.name === 'NotFoundError':
      statusCode = 404;
      message = 'Resource not found';
      errorCode = 'NOT_FOUND';
      break;
    case err.code === 'P2002': // Prisma unique constraint
      statusCode = 409;
      message = 'Resource already exists';
      errorCode = 'DUPLICATE_ENTRY';
      break;
    case err.code === 'P2025': // Prisma record not found
      statusCode = 404;
      message = 'Resource not found';
      errorCode = 'NOT_FOUND';
      break;
    case err.code === 'LIMIT_FILE_SIZE':
      statusCode = 413;
      message = 'File too large';
      errorCode = 'FILE_TOO_LARGE';
      break;
    case err.code === 'LIMIT_UNEXPECTED_FILE':
      statusCode = 400;
      message = 'Invalid file upload';
      errorCode = 'INVALID_FILE_UPLOAD';
      break;
    default:
      // For unhandled errors, mask the message in production
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred';
      }
  }

  // Standardized error response
  const response = {
    success: false,
    error: message,
    code: errorCode,
    status: statusCode
  };

  // Only include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.details = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
