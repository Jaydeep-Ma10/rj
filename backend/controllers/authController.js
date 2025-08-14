import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateAll } from '../utils/validators.js';

const prisma = new PrismaClient();

// Ensure JWT_SECRET is set in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';

// Input validation middleware using centralized validator
const validateSignupInput = (data) => {
  const { isValid, errors, values } = validateAll({
    name: data.name,
    mobile: data.mobile,
    password: data.password
  });

  return {
    errors: errors || {},
    isValid,
    values
  };
};

const validateLoginInput = (data) => {
  const { isValid, errors, values } = validateAll({
    mobile: data.mobile,
    password: data.password
  });

  return {
    errors: errors || {},
    isValid,
    values
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
    
    // Validate input using centralized validator
    const { errors, isValid, values } = validateSignupInput(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: Object.entries(errors).reduce((acc, [field, error]) => ({
          ...acc,
          [field]: error.errors[0] // Get the first error message
        }), {})
      });
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
    try {
      const user = await prisma.user.create({
        data: {
          name,
          mobile,
          password: hashedPassword,
          referralCode: userReferralCode,
          referredBy,
        },
      });
      const tokenPayload = { 
        userId: user.id, 
        mobile: user.mobile,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };
      console.log('Signing token with payload:', JSON.stringify(tokenPayload, null, 2));
      console.log('Using JWT_SECRET length:', JWT_SECRET?.length || 0);
      const token = jwt.sign(tokenPayload, JWT_SECRET);
      return res.status(201).json({ 
        token, 
        user: { 
          uid: user.id,
          id: user.id, 
          name: user.name, 
          mobile: user.mobile, 
          referralCode: user.referralCode,
          balance: user.balance || 0
        } 
      });
    } catch (createError) {
      console.error('User creation error:', createError);
      if (createError.code === 'P2002') {
        if (createError.meta?.target?.includes('name')) {
          return res.status(400).json({ error: 'This name is already in use. Please choose a different name.' });
        } else if (createError.meta?.target?.includes('mobile')) {
          return res.status(409).json({ error: 'A user with this mobile number already exists' });
        }
      }
      throw createError;
    }
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A user with these details already exists' });
    }
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// POST /api/login
export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    
    // Validate input using centralized validator
    const { errors, isValid, values } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: Object.entries(errors).reduce((acc, [field, error]) => {
          // Safely get the first error message
          const errorMessage = error?.errors?.[0] || 'Invalid input';
          return {
            ...acc,
            [field]: errorMessage
          };
        }, {})
      });
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
    res.json({ 
      token, 
      user: { 
        uid: user.id,
        id: user.id, 
        name: user.name, 
        mobile: user.mobile, 
        referralCode: user.referralCode,
        balance: user.balance || 0
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
