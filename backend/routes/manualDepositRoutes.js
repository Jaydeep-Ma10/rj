import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { submitManualDeposit } from '../controllers/manualDepositController.js';

const router = express.Router();

// 📂 Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 📥 POST /api/manual-deposit
router.post(
  '/manual-deposit',
  upload.single('slip'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('mobile').notEmpty().withMessage('Mobile is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
    body('utr').notEmpty().withMessage('UTR is required'),
    body('method').notEmpty().withMessage('Method is required'),
    (req, res, next) => {
      if (!req.file) {
        return res.status(400).json({ errors: [{ msg: 'Slip is required', param: 'slip' }] });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  submitManualDeposit
);

export default router;
