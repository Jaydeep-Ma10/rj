import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if round management is working
    const recentRound = await prisma.wingoRound.findFirst({
      where: {
        startTime: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { startTime: 'desc' }
    });

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      roundManagement: recentRound ? 'active' : 'inactive',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
