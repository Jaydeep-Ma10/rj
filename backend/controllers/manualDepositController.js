// manualDepositController.js
import { prisma } from '../prisma/client.js';
import { uploadSlipToS3, isUsingS3 } from '../services/s3TransactionSlipService.js';
import { logError } from '../utils/errorHandler.js';

const submitManualDeposit = async (req, res) => {
  try {
    console.log('Received manual deposit request:', {
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fieldname: req.file.fieldname
      } : 'No file received'
    });

    const { name, mobile, amount, utr } = req.body;
    const method = req.body.method || 'Unknown';
    const file = req.file;

    // Validate required fields
    if (!name || !amount || !utr) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, amount, and utr are required' 
      });
    }

    // Create user if not exists
    let user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          mobile: mobile || '0000000000', // Default mobile if not provided
          balance: 0,
          password: '', // required by schema
          referralCode: `${name.replace(/\s+/g, '').toLowerCase()}-${Date.now()}` // unique
        },
      });
    } else if (mobile && mobile !== '0000000000' && user.mobile !== mobile) {
      // Update mobile if provided and different from current
      user = await prisma.user.update({
        where: { id: user.id },
        data: { mobile }
      });
    }

    // Handle transaction slip upload
    let slipUrl = null;
    let s3Key = null;
    let s3Bucket = null;
    let fileUploadId = null;

    if (file) {
      console.log('Processing file upload:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
        encoding: file.encoding
      });
      
      try {
        if (isUsingS3()) {
          console.log('Using S3 for file upload');
          // Ensure file has buffer for S3 upload
          if (!file.buffer) {
            console.error('File buffer is missing, cannot upload to S3');
            throw new Error('File processing error: missing file buffer');
          }
          // Upload file to S3 using our service
          const uploadResult = await uploadSlipToS3(file, user.id, `deposit-${Date.now()}`);
          
          // Set file details from upload result
          slipUrl = uploadResult.location;
          s3Key = uploadResult.key;
          s3Bucket = uploadResult.bucket;
          
          // Create FileUpload record for S3 file
          const fileUpload = await prisma.fileUpload.create({
            data: {
              filename: uploadResult.key,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              s3Key: uploadResult.key,      // ✅ FIXED: Use uploadResult.key
              s3Bucket: uploadResult.bucket, // ✅ FIXED: Use uploadResult.bucket
              s3Url: uploadResult.location,  // ✅ FIXED: Use uploadResult.location
              uploadedBy: user.id,
              category: 'deposit_receipt',
              status: 'active',
              metadata: {
                depositType: 'manual',
                utr: utr,
                amount: parseFloat(amount)
              }
            }
          });
          fileUploadId = fileUpload.id;
          
          console.log('✅ Transaction slip uploaded to S3:', {
            location: uploadResult.location,
            key: uploadResult.key,
            bucket: uploadResult.bucket,
            fileUploadId: fileUpload.id
          });
        } else if (file.path) {
          // File was uploaded locally
          slipUrl = `/uploads/${file.filename}`;
          
          // Create FileUpload record for local file
          const fileUpload = await prisma.fileUpload.create({
            data: {
              filename: file.filename,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              s3Key: '', // Empty for local files
              s3Bucket: '',
              s3Url: slipUrl,
              uploadedBy: user.id,
              category: 'deposit_receipt',
              status: 'active',
              metadata: {
                localPath: file.path,
                depositType: 'manual',
                utr: utr,
                amount: parseFloat(amount)
              }
            }
          });
          fileUploadId = fileUpload.id;
          
          console.log('✅ Transaction slip uploaded locally:', slipUrl);
        }
      } catch (uploadError) {
        console.error('Error uploading transaction slip:', {
          message: uploadError.message,
          stack: uploadError.stack,
          code: uploadError.code,
          name: uploadError.name,
          file: file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          } : 'No file object'
        });
        throw new Error(`Failed to process transaction slip: ${uploadError.message}`);
      }
    }

    // Create manual deposit record
    const deposit = await prisma.manualDeposit.create({
      data: {
        name,
        mobile: mobile || user.mobile || '0000000000', // Ensure mobile is always provided
        amount: parseFloat(amount),
        utr,
        method: method || 'Unknown',
        slipUrl, // This will be S3 URL or local path
        userId: user.id,
        status: 'pending',
        verified: false,
        // Add metadata for tracking
        metadata: {
          s3Key,
          s3Bucket,
          fileUploadId,
          uploadMethod: isUsingS3() ? 's3' : 'local',
          submittedAt: new Date().toISOString()
        }
      },
    });

    // Log successful deposit submission
    console.log(`✅ Deposit submitted successfully:`, {
      depositId: deposit.id,
      userId: user.id,
      amount: deposit.amount,
      utr: deposit.utr,
      hasSlip: !!slipUrl,
      uploadMethod: isUsingS3() ? 's3' : 'local'
    });

    res.status(201).json({ 
      message: 'Deposit submitted successfully', 
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        utr: deposit.utr,
        status: deposit.status,
        hasSlip: !!slipUrl,
        submittedAt: deposit.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Manual deposit error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      requestBody: req.body,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    logError(error, { 
      context: 'manual_deposit_submission',
      body: req.body,
      hasFile: !!req.file 
    });
    
    res.status(500).json({ 
      error: 'Failed to submit deposit. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { submitManualDeposit };
