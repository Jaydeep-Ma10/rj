import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if S3 is configured
const isS3Configured = () => {
  const hasConfig = !!(process.env.AWS_ACCESS_KEY_ID && 
                      process.env.AWS_SECRET_ACCESS_KEY && 
                      process.env.AWS_S3_BUCKET_NAME);
  
  console.log('S3 Configuration Check:');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('- AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME ? `✅ Set (${process.env.AWS_S3_BUCKET_NAME})` : '❌ Missing');
  console.log('- AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
  
  return hasConfig;
};

// Configure AWS S3 only if credentials are available
let s3Client = null;
let BUCKET_NAME = null;

if (isS3Configured()) {
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      // Enable debug logging
      logger: console
    });
    
    BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    console.log('✅ AWS S3 configured for transaction slips');
    
    // Test S3 connection
    (async () => {
      try {
        const command = new ListBucketsCommand({});
        const data = await s3Client.send(command);
        console.log('✅ S3 Connection Test Successful');
        console.log('Available Buckets:', data.Buckets.map(b => b.Name).join(', '));
      } catch (err) {
        console.error('❌ S3 Connection Test Failed:', err.message);
      }
    })();
  } catch (error) {
    console.error('❌ Error initializing S3:', error.message);
  }
} else {
  console.warn('⚠️ AWS S3 not configured - using local storage fallback for transaction slips');
}

// Generate unique filename for transaction slips
const generateSlipFilename = (originalname, userId, depositId) => {
  const timestamp = Date.now();
  const ext = path.extname(originalname);
  // Sanitize the filename to remove special characters and spaces
  const baseName = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9-]/g, '_') // Replace special chars with underscores
    .substring(0, 50); // Limit filename length
  
  // Create a consistent path format: transaction-slips/userId/timestamp-filename.ext
  const key = `transaction-slips/${userId || 'anonymous'}/${timestamp}-${baseName}${ext}`;
  
  console.log('Generated S3 key:', {
    originalname,
    userId,
    depositId,
    generatedKey: key
  });
  
  return key;
};

// S3 Storage Configuration (only if S3 is configured)
let s3Storage = null;
if (isS3Configured()) {
  console.log('Configuring multer with S3 storage');
  
  // Custom storage engine for S3
  const s3StorageEngine = multer.memoryStorage();
  
  s3Storage = multer({
    storage: s3StorageEngine,
    fileFilter: (req, file, cb) => {
      console.log('Processing file upload:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
      });
      
      // Allow images and PDFs for transaction slips
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        console.log('File type accepted:', file.mimetype);
        cb(null, true);
      } else {
        const error = new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF files are allowed for transaction slips.');
        console.error('File type rejected:', file.mimetype);
        cb(error);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1
    }
  });
  
  // Add S3 file processing middleware
  s3Storage.processFile = (req, res, next) => {
    if (!req.file) return next();
    
    const file = req.file;
    const s3Key = `transaction-slips/${Date.now()}-${file.originalname}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };
    
    s3Client.send(new PutObjectCommand(params))
      .then(() => {
        console.log('File uploaded to S3:', s3Key);
        file.location = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
        file.key = s3Key;
        file.bucket = BUCKET_NAME;
        next();
      })
      .catch(error => {
        console.error('Error uploading to S3:', error);
        next(new Error('Failed to upload file to S3'));
      });
  };
} else {
  console.warn('⚠️ AWS S3 not configured - using local storage fallback for transaction slips');
}

// Local Storage Configuration (fallback)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/transaction-slips/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${baseName}${ext}`);
  }
});

// Create multer instance with dynamic storage selection
const transactionSlipUpload = isS3Configured() ? s3Storage : multer({
  storage: localStorage,
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs for transaction slips
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF files are allowed for transaction slips.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

// Upload transaction slip to S3 (if not already uploaded via multer)
async function uploadSlipToS3(file, userId, depositId) {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  try {
    console.log('Uploading file to S3:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path,
      userId,
      depositId
    });

    const key = generateSlipFilename(file.originalname, userId, depositId);
    // generateSlipFilename already includes the 'transaction-slips/' prefix
    
    // Ensure we have a buffer to upload
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      fileBuffer = await fs.promises.readFile(file.path);
    } else {
      throw new Error('No file buffer or path available for upload');
    }
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        uploaderId: String(userId || 'system'),
        depositId: String(depositId || 'unknown')
      }
    };

    console.log('S3 Upload Params:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      Metadata: params.Metadata
    });

    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    
    console.log('File uploaded successfully to S3:', {
      key,
      eTag: data.ETag,
      versionId: data.VersionId
    });
    
    return {
      key: key,
      location: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
      bucket: BUCKET_NAME,
      etag: data.ETag,
      s3Url: `s3://${BUCKET_NAME}/${key}`
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

// Get signed URL for private transaction slip access
const getSlipSignedUrl = async (s3Key, expiresIn = 3600) => {
  if (!isS3Configured() || !s3Client) {
    console.warn('S3 not configured - cannot generate signed URL');
    return null;
  }

  try {
    // Determine the content type based on file extension
    const getContentType = (key) => {
      const extension = key.split('.').pop().toLowerCase();
      const typeMap = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        pdf: 'application/pdf',
        // Add more MIME types as needed
      };
      return typeMap[extension] || 'application/octet-stream';
    };

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      // Add response headers to allow cross-origin access
      ResponseContentDisposition: 'inline', // Display in browser instead of download
      ResponseContentType: getContentType(s3Key), // Set content type based on file extension
      ResponseCacheControl: 'public, max-age=3600' // Cache for 1 hour
    });

    // Generate a signed URL that's valid for the specified duration
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn,
      // Add any additional signing options if needed
    });
    
    console.log('Generated signed URL for S3 object:', {
      bucket: BUCKET_NAME,
      key: s3Key,
      expiresIn,
      signedUrl: signedUrl ? 'URL generated' : 'No URL'
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', {
      error: error.message,
      stack: error.stack,
      s3Key,
      expiresIn
    });
    throw error;
  }
};

// Delete transaction slip from S3
async function deleteSlipFromS3(s3Key) {
  if (!isS3Configured()) {
    return; // No action needed for local files
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

// Check if file exists in S3
async function checkSlipExists(s3Key) {
  if (!isS3Configured()) {
    return false; // Always return false for local files
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      return false;
    }
    console.error('Error checking file existence in S3:', error);
    throw error;
  }
};

// Get transaction slip metadata
async function getSlipMetadata(s3Key) {
  if (!isS3Configured()) {
    return null; // No metadata for local files
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    const data = await s3Client.send(command);
    
    return {
      lastModified: data.LastModified,
      size: data.ContentLength,
      contentType: data.ContentType,
      metadata: data.Metadata,
      etag: data.ETag
    };
  } catch (error) {
    console.error('Error getting file metadata from S3:', error);
    throw error;
  }
};

// Utility function to determine if using S3 or local storage
const isUsingS3 = () => {
  return !!s3Client;
};

// Get appropriate URL for transaction slip (S3 signed URL or local path)
const getSlipUrl = (slipData) => {
  if (!slipData) return null;
  
  if (slipData.s3Key) {
    // Generate signed URL for S3
    return getSlipSignedUrl(slipData.s3Key);
  } else if (slipData.localPath) {
    // Return local file path
    return slipData.localPath;
  }
  
  return null;
};

// Export the S3 client, bucket name, and configuration check for use in other modules
export {
  transactionSlipUpload,
  uploadSlipToS3,
  getSlipSignedUrl,
  deleteSlipFromS3,
  checkSlipExists,
  getSlipMetadata,
  isUsingS3,
  getSlipUrl,
  isS3Configured,
  s3Client,
  BUCKET_NAME
};
