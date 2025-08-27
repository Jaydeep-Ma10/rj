import express from 'express';
import { body, validationResult } from 'express-validator';
import { submitManualDeposit } from '../controllers/manualDepositController.js';
import { uploadRateLimit, validateDeposit } from '../middleware/security.js';
import {
  transactionSlipUpload,
  isS3Configured,
  BUCKET_NAME,
  s3Client
} from '../services/s3TransactionSlipService.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

/**
 * Middleware to handle slip upload (mandatory)
 */
const handleSlipUpload = (req, res, next) => {
  console.log('📥 Incoming manual deposit request');
  console.log('Headers:', req.headers);

  transactionSlipUpload.single('slip')(req, res, async (err) => {
    if (err) {
      console.error('❌ File upload error:', err.message);
      return res.status(400).json({
        success: false,
        message: 'File upload failed',
        errors: [{ param: 'slip', msg: err.message }]
      });
    }

    // Reject if no file provided
    if (!req.file) {
      console.error('❌ Missing transaction slip');
      return res.status(400).json({
        success: false,
        message: 'Transaction slip is required',
        errors: [{ param: 'slip', msg: 'Transaction slip is required' }]
      });
    }

    console.log('✅ File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to S3 if configured
    if (isS3Configured()) {
      try {
        console.log('☁ Uploading file to S3...');
        const s3Key = `transaction-slips/${Date.now()}-${req.file.originalname}`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'private'
          })
        );

        req.file.location = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
        req.file.key = s3Key;
        req.file.bucket = BUCKET_NAME;

        console.log('✅ Uploaded to S3:', s3Key);
      } catch (uploadErr) {
        console.error('❌ S3 upload failed:', uploadErr.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload slip to S3',
          errors: [{ param: 'slip', msg: uploadErr.message }]
        });
      }
    }

    next();
  });
};

/**
 * Validation rules
 */
const depositValidationRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/).withMessage('Name can only contain letters, numbers, and spaces'),

  body('mobile')
    .optional({ checkFalsy: true })
    .isMobilePhone('any', { strictMode: false }).withMessage('Must be a valid mobile number')
    .isLength({ min: 8, max: 15 }).withMessage('Mobile number must be between 8 and 15 digits'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1, max: 1000000 }).withMessage('Amount must be between 1 and 1,000,000')
    .toFloat(),

  body('utr')
    .notEmpty().withMessage('UTR is required')
    .isString().withMessage('UTR must be a string')
    .trim()
    .isLength({ min: 5, max: 50 }).withMessage('UTR must be between 5 and 50 characters')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('UTR can only contain letters and numbers'),

  body('method')
    .optional()
    .isString().withMessage('Payment method must be a string')
    .isLength({ max: 50 }).withMessage('Payment method cannot exceed 50 characters')
];

/**
 * Validation result handler
 */
const handleValidationResult = (req, res, next) => {
  console.log('📄 Validating deposit request body:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation failed:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  next();
};

/**
 * POST /manual-deposit
 */
router.post(
  '/manual-deposit',
  uploadRateLimit,
  handleSlipUpload,
  validateDeposit,
  depositValidationRules,
  handleValidationResult,
  async (req, res, next) => {
    try {
      await submitManualDeposit(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
