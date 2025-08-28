// Admin Management Routes - For testing and verification
import express from 'express';
import { getAllAdmins, verifyAdminCredentials } from '../services/adminUserService.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// Get all admin users (protected route)
router.get('/list', requireAdmin, async (req, res) => {
  try {
    const admins = await getAllAdmins();
    res.json({
      success: true,
      count: admins.length,
      admins: admins
    });
  } catch (error) {
    console.error('Error fetching admin list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin list'
    });
  }
});

// Verify admin credentials (for testing)
router.post('/verify', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }

    const result = await verifyAdminCredentials(username, password);
    
    res.json({
      success: result.valid,
      message: result.message,
      admin: result.admin
    });
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify credentials'
    });
  }
});

// Get admin statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const admins = await getAllAdmins();
    const totalAdmins = admins.length;
    const recentLogins = admins.filter(admin => 
      admin.lastLogin && 
      new Date(admin.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    res.json({
      success: true,
      stats: {
        totalAdmins,
        recentLogins,
        oldestAdmin: admins[0]?.createdAt,
        newestAdmin: admins[admins.length - 1]?.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics'
    });
  }
});

export default router;
