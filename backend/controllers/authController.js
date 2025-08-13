import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
const { isMobilePhone } = validator;

const prisma = new PrismaClient();

// Ensure JWT_SECRET is set in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';

// Input validation middleware
const validateSignupInput = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  if (!data.mobile || !isMobilePhone(data.mobile, 'en-IN')) {
    errors.mobile = 'Please enter a valid Indian mobile number';
  }
  
  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const validateLoginInput = (data) => {
  const errors = {};
  
  if (!data.mobile || !isMobilePhone(data.mobile, 'en-IN')) {
    errors.mobile = 'Please enter a valid Indian mobile number';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

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
    
    // Input validation
    const { errors, isValid } = validateSignupInput({ name, mobile, password });
    if (!isValid) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    const existingUser = await prisma.user.findUnique({ 
      where: { 
        mobile: mobile 
      } 
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this mobile number already exists' });
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
    const token = jwt.sign({ userId: user.id, mobile: user.mobile }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, referralCode: user.referralCode } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/login
export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    
    // Input validation
    const { errors, isValid } = validateLoginInput({ mobile, password });
    if (!isValid) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    // Find user and validate password with constant-time comparison
    const user = await prisma.user.findUnique({ where: { mobile } });
    
    // Use a dummy hash for non-existent users to prevent timing attacks
    const dummyHash = await bcrypt.hash('dummy_password', 10);
    const passwordMatch = user 
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare('dummy_password', dummyHash);
    
    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, mobile: user.mobile }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, referralCode: user.referralCode } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
