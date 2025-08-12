import { prisma } from '../prisma/client.js';

/**
 * Middleware to check if user has verified KYC
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const requireKYC = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Get user with KYC status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        kycStatus: true,
        kycVerifiedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (user.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'KYC verification required',
        kycStatus: user.kycStatus,
        kycVerified: user.kycStatus === 'verified',
        message: 'Please complete KYC verification to access this feature'
      });
    }

    // Add KYC info to request for use in subsequent middleware/controllers
    req.user.kycStatus = user.kycStatus;
    req.user.kycVerifiedAt = user.kycVerifiedAt;
    
    next();
  } catch (error) {
    console.error('KYC check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error verifying KYC status' 
    });
  }
};

/**
 * Middleware to check if KYC is pending or verified
 * Used for features that can be accessed during KYC review
 */
export const requireKYCSubmission = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        kycStatus: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (user.kycStatus === 'not_verified') {
      return res.status(403).json({
        success: false,
        error: 'KYC submission required',
        kycStatus: user.kycStatus,
        message: 'Please submit KYC documents to access this feature'
      });
    }

    next();
  } catch (error) {
    console.error('KYC submission check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error checking KYC submission status' 
    });
  }
};
