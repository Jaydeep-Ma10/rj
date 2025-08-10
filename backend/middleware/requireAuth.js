import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database to ensure they still exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          mobile: true,
          balance: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. User not found.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired. Please login again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token format.'
        });
      } else {
        throw jwtError;
      }
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error. Please try again.'
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First verify the token using requireAuth
    await requireAuth(req, res, () => {});
    
    // If requireAuth didn't send a response, check if user is admin
    if (!res.headersSent) {
      const user = req.user;
      
      // Check if user is admin (you might need to adjust this based on your user model)
      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }
      
      next();
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Admin authentication error. Please try again.'
    });
  }
};
