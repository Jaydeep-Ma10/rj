import express from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getAllWithdrawals,
  verifyWithdrawal,
  rejectWithdrawal,
  submitManualWithdraw
} from '../controllers/manualWithdrawController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/admin/withdrawals', requireAdmin, getAllWithdrawals);
router.post('/admin/withdrawals/:id/verify', requireAdmin, verifyWithdrawal);
router.post('/admin/withdrawals/:id/reject', requireAdmin, rejectWithdrawal);

// User withdrawal submission
router.post(
  '/manual-withdraw',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('mobile').notEmpty().withMessage('Mobile is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
    body('accountHolder').notEmpty().withMessage('Account holder name is required'),
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('ifsc').notEmpty().withMessage('IFSC code is required'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  submitManualWithdraw
);

export default router;
