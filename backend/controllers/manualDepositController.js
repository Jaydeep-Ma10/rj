// manualDepositController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const submitManualDeposit = async (req, res) => {
  try {
    const { name, mobile, amount, utr } = req.body;
    const method = req.body.method || 'Unknown';
    const file = req.file;
    const slipUrl = file ? `/uploads/${file.filename}` : null;

    // 🔧 Create user if not exists
    let user = await prisma.user.findUnique({ where: { name } });

    // Debug logs
    console.log('REQ BODY:', req.body);
    console.log('REQ FILE:', req.file);

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          mobile,
          balance: 0,
          password: '', // required by schema
          referralCode: `${name.replace(/\s+/g, '').toLowerCase()}-${Date.now()}` // unique
        },
      });
    }

    const deposit = await prisma.manualDeposit.create({
      data: {
        name,
        mobile,
        amount: parseFloat(amount),
        utr,
        method,
        slipUrl,
        userId: user.id, // ✅ associate userId
        status: 'pending',
        verified: false
      },
    });

    res.status(201).json({ message: 'Deposit submitted', deposit });
  } catch (error) {
    console.error('❌ Manual deposit error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
