import express from 'express';
import { body, validationResult } from 'express-validator';
import { submitManualDeposit } from '../controllers/manualDepositController.js';
import { 
  transactionSlipUpload, 
  isS3Configured,
  BUCKET_NAME,
  s3Client
} from '../services/s3TransactionSlipService.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

// 📥 POST /api/manual-deposit - Submit manual deposit with transaction slip
router.post(
  '/manual-deposit',
  // First, handle the file upload if present
  (req, res, next) => {
    console.log('Starting manual deposit request processing');
    console.log('Request headers:', req.headers);
    
    // Handle file upload if present
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      console.log('Processing multipart form data');
      
      // First, parse the form data and get the file
      transactionSlipUpload.single('slip')(req, res, (err) => {
        if (err) {
          console.error('File upload error:', err);
          return res.status(400).json({ 
            errors: [{ 
              msg: 'File upload failed', 
              param: 'slip',
              detail: err.message 
            }] 
          });
        }
        
        console.log('File upload processed:', req.file ? 'File received' : 'No file');
        
        // If we're using S3 and have a file, upload it to S3
        if (isS3Configured() && req.file) {
          console.log('Uploading file to S3...');
          const s3Key = `transaction-slips/${Date.now()}-${req.file.originalname}`;
          const params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'private'
          };
          
          s3Client.send(new PutObjectCommand(params))
            .then(() => {
              console.log('File uploaded to S3:', s3Key);
              req.file.location = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
              req.file.key = s3Key;
              req.file.bucket = BUCKET_NAME;
              next();
            })
            .catch(error => {
              console.error('Error uploading to S3:', error);
              return res.status(500).json({ 
                errors: [{ 
                  msg: 'Failed to upload file to S3',
                  param: 'slip',
                  detail: error.message 
                }] 
              });
            });
        } else {
          next();
        }
      });
    } else {
      console.log('No multipart form data detected, proceeding without file');
      next();
    }
  },
  // Then validate the request
  [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isString().withMessage('Name must be a string')
      .trim()
      .escape(),
      
    body('mobile')
      .notEmpty().withMessage('Mobile is required')
      .isMobilePhone().withMessage('Must be a valid mobile number')
      .trim(),
      
    body('amount')
      .notEmpty().withMessage('Amount is required')
      .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
      
    body('utr')
      .notEmpty().withMessage('UTR is required')
      .isString().withMessage('UTR must be a string')
      .trim(),
      
    body('method')
      .optional()
      .isString().withMessage('Method must be a string')
      .trim()
      .escape(),
      
    // Custom validation middleware
    (req, res, next) => {
      console.log('Validating request body:', req.body);
      console.log('Uploaded file:', req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fieldname: req.file.fieldname
      } : 'No file uploaded');
      
      // File is optional, but if provided, validate it was processed
      if (req.file && !req.file.location && !req.file.path) {
        console.error('File upload failed - no location or path');
        return res.status(400).json({ 
          errors: [{ 
            msg: 'Transaction slip upload failed', 
            param: 'slip',
            detail: 'File was not processed correctly' 
          }] 
        });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ 
          errors: errors.array().map(err => ({
            ...err,
            value: undefined // Don't send back the actual values
          }))
        });
      }
      
      console.log('Request validation passed');
      next();
    }
  ],
  // Finally, process the request
  submitManualDeposit
);

export default router;
