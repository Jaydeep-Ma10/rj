import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Handle user withdrawal submission
export const submitManualWithdraw = async (req, res) => {
  try {
    const { name, mobile, amount, accountHolder, accountNumber, ifsc } = req.body;
    // Check user balance
    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (parseFloat(amount) > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    // Create withdrawal request
    const withdrawal = await prisma.manualWithdraw.create({
      data: {
        name,
        mobile,
        amount: parseFloat(amount),
        accountHolder,
        accountNumber,
        ifsc,
        status: 'pending',
      },
    });
    res.status(201).json({ message: "Withdrawal request submitted", withdrawal });
  } catch (error) {
    console.error("❌ Manual withdraw error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get all withdrawal requests
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.manualWithdraw.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ withdrawals });
  } catch (err) {
    console.error('❌ Error fetching withdrawals:', err);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};

// Approve withdrawal
export const verifyWithdrawal = async (req, res) => {
  const { id } = req.params;
  try {
    // Step 1: Approve the withdrawal
    const withdrawal = await prisma.manualWithdraw.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' }
    });

    // Step 2: Find the user by mobile
    const user = await prisma.user.findUnique({
      where: { mobile: withdrawal.mobile }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 3: Deduct user's virtual balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance - withdrawal.amount
      }
    });

    res.json({ message: '✅ Withdrawal approved and balance deducted', withdrawal });
  } catch (err) {
    console.error('❌ Error approving withdrawal:', err);
    res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
};

// Reject withdrawal
export const rejectWithdrawal = async (req, res) => {
  const { id } = req.params;
  try {
    const withdrawal = await prisma.manualWithdraw.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected' }
    });
    res.json(withdrawal);
  } catch (err) {
    console.error('❌ Error rejecting withdrawal:', err);
    res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
};
