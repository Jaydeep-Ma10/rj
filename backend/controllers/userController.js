// controllers/userController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { name } = req.params;
    const user = await prisma.user.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        mobile: true,
        referralCode: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserDeposits = async (req, res) => {
  try {
    const { name } = req.params;
    const user = await prisma.user.findUnique({ where: { name } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const deposits = await prisma.manualDeposit.findMany({
      where: { name },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ deposits });
  } catch (error) {
    console.error('❌ Error fetching user deposits:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all withdrawals for a user
export const getUserWithdrawals = async (req, res) => {
  try {
    const { name } = req.params;
    const user = await prisma.user.findUnique({ where: { name } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const withdrawals = await prisma.manualWithdraw.findMany({
      where: { name },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ withdrawals });
  } catch (error) {
    console.error('❌ Error fetching user withdrawals:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
