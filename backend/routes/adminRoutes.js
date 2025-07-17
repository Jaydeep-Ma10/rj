import express from 'express';
import {
  getAllDeposits,
  verifyDeposit,
  rejectDeposit
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/admin/deposits', getAllDeposits);
router.post('/admin/deposits/:id/verify', verifyDeposit);
router.post('/admin/deposits/:id/reject', rejectDeposit);

export default router;
