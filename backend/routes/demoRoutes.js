// routes/demoRoutes.js
import express from 'express';
import { demoUserService } from '../services/demoUserService.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { prisma } from '../prisma/client.js';

const router = express.Router();

/**
 * Admin route to get demo users status
 */
router.get('/status', requireAdmin, async (req, res) => {
  try {
    const demoUsersCount = demoUserService.getDemoUsersCount();
    const demoUserIds = demoUserService.getDemoUserIds();
    
    res.json({
      success: true,
      data: {
        enabled: process.env.DEMO_USERS_ENABLED === 'true',
        count: demoUsersCount,
        userIds: demoUserIds
      }
    });
  } catch (error) {
    console.error('Error getting demo users status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo users status'
    });
  }
});

/**
 * Admin route to refresh demo users from database
 */
router.post('/refresh', requireAdmin, async (req, res) => {
  try {
    await demoUserService.refreshDemoUsers();
    
    res.json({
      success: true,
      message: 'Demo users refreshed successfully',
      count: demoUserService.getDemoUsersCount()
    });
  } catch (error) {
    console.error('Error refreshing demo users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh demo users'
    });
  }
});

/**
 * Admin route to add user to demo list
 */
router.post('/add/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Update user in database
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isDemoUser: true }
    });
    
    // Add to service
    demoUserService.addDemoUser(parseInt(userId));
    
    res.json({
      success: true,
      message: 'User added to demo list successfully'
    });
  } catch (error) {
    console.error('Error adding demo user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add demo user'
    });
  }
});

/**
 * Admin route to remove user from demo list
 */
router.post('/remove/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Update user in database
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isDemoUser: false }
    });
    
    // Remove from service
    demoUserService.removeDemoUser(parseInt(userId));
    
    res.json({
      success: true,
      message: 'User removed from demo list successfully'
    });
  } catch (error) {
    console.error('Error removing demo user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove demo user'
    });
  }
});

export default router;
