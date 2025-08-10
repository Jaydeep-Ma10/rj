import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import crypto from 'crypto';
import path from 'path';
import { logger } from '../utils/logger.js';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// File type validation
const ALLOWED_FILE_TYPES = {
  'deposit_slip': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  'kyc_document': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  'profile_image': ['image/jpeg', 'image/png', 'image/jpg']
};

const MAX_FILE_SIZE = {
  'deposit_slip': 5 * 1024 * 1024, // 5MB
  'kyc_document': 10 * 1024 * 1024, // 10MB
  'profile_image': 2 * 1024 * 1024 // 2MB
};

// Generate secure file key
function generateFileKey(uploadType, userId, originalName) {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${uploadType}/${userId}/${timestamp}-${randomString}${extension}`;
}

// File filter function
function fileFilter(uploadType) {
  return (req, file, cb) => {
    const allowedTypes = ALLOWED_FILE_TYPES[uploadType];
    if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
      logger.warn('File type not allowed', {
        uploadType,
        mimetype: file.mimetype,
        filename: file.originalname,
        userId: req.user?.id
      });
      return cb(new Error(`File type ${file.mimetype} not allowed for ${uploadType}`), false);
    }
    cb(null, true);
  };
}

// Create multer upload middleware for S3
export function createS3Upload(uploadType, fieldName = 'file') {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
  }

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, {
          uploadType,
          userId: req.user?.id?.toString() || 'anonymous',
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        });
      },
      key: function (req, file, cb) {
        const userId = req.user?.id || 'anonymous';
        const key = generateFileKey(uploadType, userId, file.originalname);
        cb(null, key);
      }
    }),
    fileFilter: fileFilter(uploadType),
    limits: {
      fileSize: MAX_FILE_SIZE[uploadType] || 5 * 1024 * 1024
    }
  });

  return upload.single(fieldName);
}

// Upload file directly to S3
export async function uploadFileToS3(file, uploadType, userId) {
  try {
    const key = generateFileKey(uploadType, userId, file.originalname);
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        uploadType,
        userId: userId.toString(),
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      }
    };

    const result = await s3.upload(uploadParams).promise();
    
    logger.info('File uploaded to S3', {
      key,
      bucket: BUCKET_NAME,
      userId,
      uploadType,
      size: file.size
    });

    return {
      key,
      bucket: BUCKET_NAME,
      location: result.Location,
      etag: result.ETag
    };
  } catch (error) {
    logger.error('S3 upload failed', {
      error: error.message,
      uploadType,
      userId,
      filename: file.originalname
    });
    throw error;
  }
}

// Get signed URL for file access
export async function getSignedUrl(key, expiresIn = 3600) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    logger.error('Failed to generate signed URL', {
      error: error.message,
      key
    });
    throw error;
  }
}

// Delete file from S3
export async function deleteFileFromS3(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    
    logger.info('File deleted from S3', { key, bucket: BUCKET_NAME });
    return true;
  } catch (error) {
    logger.error('S3 delete failed', {
      error: error.message,
      key
    });
    throw error;
  }
}

// Check if S3 is properly configured
export function validateS3Config() {
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required S3 environment variables: ${missing.join(', ')}`);
  }

  return true;
}

// Fallback to local storage if S3 is not configured
export function createLocalUpload(uploadType, fieldName = 'file') {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${uploadType}/`);
    },
    filename: function (req, file, cb) {
      const userId = req.user?.id || 'anonymous';
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const extension = path.extname(file.originalname);
      cb(null, `${userId}-${timestamp}-${randomString}${extension}`);
    }
  });

  return multer({
    storage,
    fileFilter: fileFilter(uploadType),
    limits: {
      fileSize: MAX_FILE_SIZE[uploadType] || 5 * 1024 * 1024
    }
  }).single(fieldName);
}

// Smart upload - use S3 if configured, otherwise local
export function createSmartUpload(uploadType, fieldName = 'file') {
  try {
    validateS3Config();
    logger.info('Using S3 for file uploads', { uploadType });
    return createS3Upload(uploadType, fieldName);
  } catch (error) {
    logger.warn('S3 not configured, falling back to local storage', {
      uploadType,
      error: error.message
    });
    return createLocalUpload(uploadType, fieldName);
  }
}
