import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';

// Helper to generate referral code
function generateReferralCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/signup
export const signup = async (req, res) => {
  try {
    const { name, mobile, password, referralCode } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password required' });
    }
    const existingUser = await prisma.user.findUnique({ where: { name } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate unique referral code
    let userReferralCode;
    let codeExists = true;
    while (codeExists) {
      userReferralCode = generateReferralCode();
      codeExists = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
    }
    // If referralCode provided, check if it exists
    let referredBy = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (!referrer) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
      referredBy = referralCode;
    }
    const user = await prisma.user.create({
      data: {
        name,
        mobile,
        password: hashedPassword,
        referralCode: userReferralCode,
        referredBy,
      },
    });
    const token = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, referralCode: user.referralCode } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/login
export const login = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password required' });
    }
    const user = await prisma.user.findUnique({ where: { name } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, referralCode: user.referralCode } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
