// manualDepositController.js
import { prisma } from '../prisma/client.js';
import { uploadSlipToS3, isUsingS3 } from '../services/s3TransactionSlipService.js';
import { logError } from '../utils/errorHandler.js';
import { validateName, validateMobile } from '../utils/validators.js';

const submitManualDeposit = async (req, res) => {
  console.log('Starting manual deposit submission');
  
  // Log request details (safely, without sensitive data)
  console.log('Deposit request:', {
    userId: req.user?.id,
    userName: req.user?.name,
    amount: req.body.amount,
    hasFile: !!req.file,
    fileInfo: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file attached'
  });
  
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

    const { name, mobile, amount, utr, method } = req.body;
    
    // Validate required fields
    if (!amount || !utr) {
      console.error('Missing required fields:', { amount, utr });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['amount', 'utr']
      });
    }

    // Validate name if provided
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          field: 'name',
          errors: nameValidation.errors
        });
      }
    }

    // Validate mobile if provided
    if (mobile) {
      const mobileValidation = validateMobile(mobile);
      if (!mobileValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          field: 'mobile',
          errors: mobileValidation.errors
        });
      }
    }
    // ✅ Require transaction slip file
if (!req.file) {
  console.error('Missing transaction slip file');
  return res.status(400).json({
    success: false,
    message: 'Transaction slip is required',
    field: 'slip'
  });
}
  
    
    // Validate amount is a positive number
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
        field: 'amount',
        value: amount
      });
    }
    
    // Create user if not exists
    let user = await prisma.user.findUnique({ where: { mobile } });

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

    // Prepare deposit data
    const depositData = {
      userId: user.id,
      name: name.trim(),
      amount: depositAmount,
      utr: utr.trim(),
      method: method ? method.trim() : 'BANK_TRANSFER',
      status: 'PENDING',
      slipUrl: null,
      ...(mobile && { mobile: mobile.trim() })
    };
    
    // Handle file upload if present
    const file = req.file;
    let fileProcessingError = null;
    
    if (file) {
      try {
        // Check if S3 storage was used (file will have S3 metadata)
        if (file.key && file.bucket) {
          // S3 upload was successful, use S3 URL
          let s3Url = file.location;
          if (!s3Url) {
            s3Url = `https://${file.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${file.key}`;
          }
          
          // Ensure the URL has proper protocol
          if (s3Url && !s3Url.startsWith('https://') && !s3Url.startsWith('http://')) {
            s3Url = `https://${s3Url}`;
          }
          
          depositData.slipUrl = s3Url;
          depositData.s3Key = file.key;
          depositData.s3Bucket = file.bucket;
          
          console.log('File processed successfully with S3:', {
            originalname: file.originalname,
            s3Key: file.key,
            s3Bucket: file.bucket,
            s3Url: depositData.slipUrl,
            size: file.size
          });
          
          console.log('Transaction slip uploaded to S3:', depositData.slipUrl);
        } else {
          // Fallback to local storage (for development or when S3 is not configured)
          const fileName = `${Date.now()}-${file.originalname}`;
          depositData.slipUrl = `/uploads/${fileName}`;
          
          console.log('File processed successfully (local storage):', {
            originalname: file.originalname,
            destination: depositData.slipUrl,
            size: file.size
          });
          
          console.log('Transaction slip uploaded locally:', depositData.slipUrl);
        }
      } catch (uploadError) {
        fileProcessingError = uploadError;
        console.error('Error uploading transaction slip:', {
          message: uploadError.message,
          stack: uploadError.stack,
          code: uploadError.code,
          name: uploadError.name,
          file: file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.buffer ? `Buffer(${file.buffer.length} bytes)` : 'No buffer'
          } : 'No file object'
        });
        // Don't fail the entire deposit if file upload fails
        console.warn('Continuing with deposit despite file upload error');
      }
    }

    // Create manual deposit record with transaction for data consistency
    const deposit = await prisma.$transaction(async (tx) => {
      // Create the deposit record
      // const depositData = {
      //   name: name.trim(),
      //   mobile: (mobile || user.mobile || '0000000000').trim(),
      //   amount: parseFloat(amount),
      //   utr: utr.trim(),
      //   method: (method || 'Unknown').trim(),
      //   slipUrl: file ? `/uploads/${Date.now()}-${file.originalname}` : null,
      //   userId: user.id,
      //   status: 'PENDING',
      //   verified: false,
      //   notes: fileProcessingError ? 
      //     `Warning: File upload failed - ${fileProcessingError.message}` : 
      //     undefined,
      //   metadata: {
      //     uploadMethod: isUsingS3() ? 's3' : 'local',
      //     submittedAt: new Date().toISOString()
      //   }
      // };

      // Prepare base metadata
      let metadata = {
        uploadMethod: isUsingS3() ? 's3' : 'local',
        submittedAt: new Date().toISOString()
      };

      // Add S3 metadata if file was uploaded to S3
      if (file && file.key && file.bucket) {
        metadata = {
          ...metadata,
          s3Key: file.key,
          s3Bucket: file.bucket,
          originalFileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageType: 'S3'
        };
      } else if (file) {
        metadata = {
          ...metadata,
          originalFileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageType: 'LOCAL'
        };
      }

      const depositData = {
        name: name.trim(),
        mobile: (mobile || user.mobile || '0000000000').trim(),
        amount: parseFloat(amount),
        utr: utr.trim(),
        method: (method || 'Unknown').trim(),
        slipUrl: file && file.key && file.bucket ? 
          (file.location || `https://${file.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${file.key}`) :
          (file ? `/uploads/${Date.now()}-${file.originalname}` : null),
        status: 'PENDING',
        verified: false,
        userId: user.id,
        notes: fileProcessingError ?
          `Warning: File upload failed - ${fileProcessingError.message}` :
          undefined,
        metadata: metadata
      };

      // Create the deposit record in the database
      const deposit = await tx.manualDeposit.create({
        data: depositData
      });

      return deposit;
    });

    // Log successful deposit submission
    console.log(`✅ Deposit submitted successfully:`, {
      depositId: deposit.id,
      userId: user.id,
      amount: deposit.amount,
      status: deposit.status
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Deposit submitted successfully',
      data: {
        depositId: deposit.id,
        amount: deposit.amount,
        status: deposit.status,
        slipUrl: deposit.slipUrl
      }
    });
    
  } catch (error) {
    // Log the error
    console.error('❌ Error in manual deposit submission:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      requestBody: req.body,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    // Log to error tracking
    logError(error, { 
      context: 'manual_deposit_submission',
      body: req.body,
      hasFile: !!req.file 
    });
    
    // Return error response
    return res.status(500).json({ 
      success: false,
      message: 'Failed to submit deposit. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  }

export { submitManualDeposit };
