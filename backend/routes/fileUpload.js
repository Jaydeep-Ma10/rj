import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/requireAuth.js';
import { prisma } from '../prisma/client.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for local file storage (matching existing pattern)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `uploads/${req.uploadCategory || 'general'}/`;
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// File upload validation
const validateFileUpload = [
  body('category')
    .notEmpty()
    .withMessage('File category is required')
    .isIn(['kyc_document', 'profile_image', 'deposit_receipt'])
    .withMessage('Invalid file category'),
  body('documentType')
    .optional()
    .isString()
    .withMessage('Document type must be a string')
];

// Upload file endpoint
const uploadFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { category, documentType } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Create file record in database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        s3Key: req.file.filename,
        s3Bucket: 'local',
        s3Url: `/uploads/${category}/${req.file.filename}`,
        uploadedBy: userId,
        category,
        metadata: {
          documentType,
          uploadedAt: new Date().toISOString(),
          path: req.file.path
        }
      }
    });

    // If this is a KYC document, create KYC record
    if (category === 'kyc_document' && documentType) {
      await prisma.kycDocument.create({
        data: {
          userId,
          documentType,
          fileUploadId: fileUpload.id,
          metadata: {
            uploadedAt: new Date().toISOString(),
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: fileUpload.id,
        filename: fileUpload.filename,
        originalName: fileUpload.originalName,
        category: fileUpload.category,
        size: fileUpload.size,
        uploadedAt: fileUpload.createdAt
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed. Please try again later.'
    });
  }
};

// Set upload category middleware
const setUploadCategory = (category) => {
  return (req, res, next) => {
    req.uploadCategory = category;
    next();
  };
};

// File upload endpoints
router.post('/upload/kyc', 
  requireAuth,
  setUploadCategory('kyc_document'),
  upload.single('file'),
  validateFileUpload,
  uploadFile
);

router.post('/upload/profile', 
  requireAuth,
  setUploadCategory('profile_image'),
  upload.single('file'),
  validateFileUpload,
  uploadFile
);

router.post('/upload/deposit', 
  requireAuth,
  setUploadCategory('deposit_receipt'),
  upload.single('file'),
  validateFileUpload,
  uploadFile
);

// Get user's files
router.get('/files', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, page = 1, limit = 10 } = req.query;

    const where = {
      uploadedBy: userId,
      status: 'active'
    };

    if (category) {
      where.category = category;
    }

    const [files, total] = await Promise.all([
      prisma.fileUpload.findMany({
        where,
        select: {
          id: true,
          filename: true,
          originalName: true,
          category: true,
          size: true,
          createdAt: true,
          s3Url: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.fileUpload.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get files. Please try again later.'
    });
  }
});

// Get file URL
router.get('/file/:fileId/url', requireAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        id: parseInt(fileId),
        uploadedBy: userId,
        status: 'active'
      }
    });

    if (!fileUpload) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: fileUpload.id,
        url: fileUpload.s3Url,
        filename: fileUpload.originalName,
        category: fileUpload.category
      }
    });

  } catch (error) {
    console.error('Get file URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file URL. Please try again later.'
    });
  }
});

// Delete file
router.delete('/file/:fileId', requireAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        id: parseInt(fileId),
        uploadedBy: userId,
        status: 'active'
      }
    });

    if (!fileUpload) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Mark file as deleted in database
    await prisma.fileUpload.update({
      where: { id: parseInt(fileId) },
      data: { status: 'deleted' }
    });

    // Try to delete physical file
    try {
      if (fileUpload.metadata?.path) {
        fs.unlinkSync(fileUpload.metadata.path);
      }
    } catch (fsError) {
      console.warn('Failed to delete physical file:', fsError.message);
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'File deletion failed. Please try again later.'
    });
  }
});

export default router;
