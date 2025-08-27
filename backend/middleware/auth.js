import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';
import { logger } from '../utils/logger.js';

// Ensure JWT_SECRET is set - required for all environments
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
const JWT_SECRET = process.env.JWT_SECRET;

export const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header (case-insensitive)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const token = authHeader.split(' ')[1];
    
    logger.debug('Authentication attempt', { hasToken: !!token, ip: req.ip });

    if (!token) {
      logger.warn('Authentication failed: No token provided', { ip: req.ip });
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. Authentication required.' 
      });
    }

    // Verify token with secure error handling
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user ID from token (support multiple possible fields)
      const userId = decoded.userId || decoded.id || decoded.sub;
      
      if (!userId) {
        logger.warn('Authentication failed: Invalid token structure', { ip: req.ip });
        return res.status(401).json({ 
          success: false,
          error: 'Authentication failed. Invalid token.'
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          mobile: true, 
          name: true,
          balance: true,
          createdAt: true
        }
      });

      if (!user) {
        logger.warn('Authentication failed: User not found', { userId, ip: req.ip });
        return res.status(401).json({ 
          success: false,
          error: 'Authentication failed.'
        });
      }
      
      logger.debug('User authenticated successfully', { userId: user.id, ip: req.ip });

      // Attach user to request object
      req.user = user;
      return next();
      
    } catch (error) {
      logger.error('Authentication error', { error: error.message, ip: req.ip });
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed.' 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Session expired. Please login again.' 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Authentication failed.' 
      });
    }
  } catch (error) {
    logger.error('Unexpected authentication error', { error: error.message, ip: req.ip });
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed.' 
    });
  }
};

// Admin middleware
// Use this for routes that require admin access
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin privileges required.' 
    });
  }
};
