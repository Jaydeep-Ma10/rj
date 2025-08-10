import express from 'express';
import { 
  getDeposits as getAllDeposits, 
  approveDeposit as verifyDeposit, 
  rejectDeposit, 
  getDepositDetails 
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/requireAuth.js';

const router = express.Router();

// Admin deposit management routes
router.get('/admin/deposits', getAllDeposits);
router.get('/admin/deposits/:id', getDepositDetails);
router.post('/admin/deposits/:id/verify', verifyDeposit);
router.post('/admin/deposits/:id/reject', rejectDeposit);

export default router;
