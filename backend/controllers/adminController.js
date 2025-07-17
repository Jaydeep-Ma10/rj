import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// ✅ Get all deposit requests (sorted by newest first)
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await prisma.manualDeposit.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ deposits });
  } catch (err) {
    console.error('❌ Error fetching deposits:', err);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
};

// ✅ Approve deposit and update user balance
export const verifyDeposit = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Approve the deposit
    const deposit = await prisma.manualDeposit.update({
      where: { id: parseInt(id) },
      data: {
        verified: true,
        status: 'approved'
      }
    });

    // Step 2: Find the user by name
    const user = await prisma.user.findUnique({
      where: { name: deposit.name }
    });

    // Step 3: If user not found, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 4: Update user's virtual balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + deposit.amount
      }
    });

    res.json({ message: '✅ Deposit approved and balance updated', deposit });
  } catch (err) {
    console.error('❌ Error approving deposit:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// ✅ Reject deposit
export const rejectDeposit = async (req, res) => {
  const { id } = req.params;

  try {
    const deposit = await prisma.manualDeposit.update({
      where: { id: parseInt(id) },
      data: {
        verified: false,
        status: 'rejected'
      }
    });

    res.json({ message: '❌ Deposit rejected', deposit });
  } catch (err) {
    console.error('❌ Error rejecting deposit:', err);
    res.status(500).json({ error: 'Rejection failed' });
  }
};
