// routes/userRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/user/:mobile/balance', async (req, res) => {
  try {
    const { mobile } = req.params;

    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /user/id/:id/balance - fetch user balance by user id (number)
router.get('/user/id/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ balance: user.balance });
  } catch (error) {
    console.error('❌ Error fetching balance by id:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

import {
  getUserDeposits,
  getUserProfile,
  getUserWithdrawals
} from '../controllers/userController.js';

router.get('/user/:mobile/deposits', getUserDeposits);
router.get('/user/:mobile/profile', getUserProfile);
router.get('/user/:mobile/withdrawals', getUserWithdrawals);

export default router;
