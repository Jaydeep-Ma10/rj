import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { authRateLimit, validateSignup, validateAuth } from '../middleware/security.js';

const router = express.Router();

// POST /api/signup
router.post('/signup', authRateLimit, validateSignup, signup);

// POST /api/login
router.post('/login', authRateLimit, validateAuth, login);

export default router;
