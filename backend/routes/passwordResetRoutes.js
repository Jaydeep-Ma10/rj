import express from 'express';
import { 
  requestPasswordResetOTP, 
  verifyPasswordResetOTP, 
  resetPassword,
  validateRequestOTP,
  validateVerifyOTP,
  validateResetPassword
} from '../controllers/passwordResetController.js';

const router = express.Router();

// POST /api/password-reset/request-otp
// Request OTP for password reset
router.post('/request-otp', validateRequestOTP, requestPasswordResetOTP);

// POST /api/password-reset/verify-otp  
// Verify OTP and get reset token
router.post('/verify-otp', validateVerifyOTP, verifyPasswordResetOTP);

// POST /api/password-reset/reset-password
// Reset password using reset token
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;
