import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';

// Debug: Log the JWT secret being used
console.log('JWT Secret:', JWT_SECRET ? 'Set' : 'Not set');

export const auth = async (req, res, next) => {
  try {
    // Debug log
    console.log('\n=== Auth Middleware Debug ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // Get token from Authorization header (case-insensitive)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const token = authHeader.split(' ')[1];
    
    console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'No token found');

    if (!token) {
      console.error('No token found in Authorization header');
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token with detailed error handling
    try {
      console.log('Verifying token with JWT_SECRET length:', JWT_SECRET?.length || 0);
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Successfully decoded token. Payload:', JSON.stringify(decoded, null, 2));
      
      // Log the actual fields in the decoded token
      console.log('Token payload fields:', Object.keys(decoded).join(', '));
      
      // Get user ID from token (support multiple possible fields)
      const userId = decoded.userId || decoded.id || decoded.sub;
      console.log('Extracted userId from token:', userId);
      
      if (!userId) {
        const errorMsg = `No valid user ID found in token. Token fields: ${Object.keys(decoded).join(', ')}`;
        console.error(errorMsg, 'Full token:', JSON.stringify(decoded, null, 2));
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token: No user ID found in token',
          tokenFields: Object.keys(decoded)
        });
      }
      
      console.log('Looking up user in database with ID:', userId);
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

      console.log('User lookup result:', user ? `Found user ${user.id}` : 'User not found');

      if (!user) {
        console.error('User not found in database');
        return res.status(401).json({ 
          success: false,
          error: 'Authentication failed. User not found.'
        });
      }
      
      // User is considered active by default since there's no status field
      console.log(`User ${user.id} authenticated successfully`);

      // Attach user to request object
      console.log(`Successfully authenticated user ${user.id} (${user.name})`);
      req.user = user;
      return next();
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        console.error('JWT Error Details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed. Invalid token.' 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token has expired. Please login again.' 
        });
      }
      
      console.error('Unexpected error in auth middleware:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Authentication failed due to an unexpected error.' 
      });
    }
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed due to an unexpected error.' 
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
