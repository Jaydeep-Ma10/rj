import { prisma } from '../prisma/client.js';
import { getSlipSignedUrl, isUsingS3 } from '../services/s3TransactionSlipService.js';
import { logError } from '../utils/errorHandler.js';

// Helper function to extract S3 key from URL
function extractS3KeyFromUrl(url) {
  if (!url) return null;
  
  try {
    // If it's already a key (no protocol), return as is
    if (!url.startsWith('http')) {
      return url.startsWith('/') ? url.substring(1) : url;
    }
    
    // Parse the URL
    const parsedUrl = new URL(url);
    let pathname = parsedUrl.pathname;
    
    // Remove leading slash
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }
    
    // For S3 URLs, the key is everything after the bucket name
    // Handle different S3 URL formats:
    // 1. https://bucket-name.s3.region.amazonaws.com/key
    // 2. https://s3.region.amazonaws.com/bucket-name/key
    if (parsedUrl.hostname.includes('amazonaws.com')) {
      const pathParts = pathname.split('/');
      
      if (parsedUrl.hostname.startsWith('s3.') || parsedUrl.hostname.includes('.s3.')) {
        // Format 1: bucket in hostname, key is full pathname
        return decodeURIComponent(pathname);
      } else {
        // Format 2: bucket in path, remove first part
        pathParts.shift(); // Remove bucket name
        return decodeURIComponent(pathParts.join('/'));
      }
    }
    
    // For other URLs, return the pathname
    return decodeURIComponent(pathname);
  } catch (error) {
    console.error('Error extracting S3 key from URL:', { url, error: error.message });
    return null;
  }
}

// ✅ Get all deposit requests (sorted by newest first)
export const getDeposits = async (req, res) => {
  try {
    const deposits = await prisma.manualDeposit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            balance: true
          }
        }
      }
    });

    // Process deposits to handle S3 URLs for transaction slips
    const processedDeposits = await Promise.all(
      deposits.map(async (deposit) => {
        let slipViewUrl = deposit.slipUrl;
        let hasSlip = false;
        
        // If using S3 and deposit has a slip URL
        if (isUsingS3() && deposit.slipUrl) {
          try {
            // First, try to get S3 key from metadata if available
            let key = deposit.metadata?.s3Key;
            
            if (!key) {
              // Fallback: Extract key from S3 URL
              key = extractS3KeyFromUrl(deposit.slipUrl);
            }
            
            if (key) {
              console.log('Generating signed URL for deposit:', {
                depositId: deposit.id,
                s3Key: key,
                originalUrl: deposit.slipUrl
              });
              
              // Generate signed URL for S3
              slipViewUrl = await getSlipSignedUrl(key, 3600); // 1 hour expiry
              
              // Ensure the URL is absolute (starts with http:// or https://)
              if (slipViewUrl && !slipViewUrl.startsWith('http')) {
                console.warn(`Generated signed URL is not absolute: ${slipViewUrl}`);
                slipViewUrl = `https://${slipViewUrl}`;
              }
              
              console.log('Final slip view URL:', {
                depositId: deposit.id,
                originalUrl: deposit.slipUrl,
                signedUrl: slipViewUrl,
                isAbsolute: slipViewUrl?.startsWith('http')
              });
              
              hasSlip = true;
            } else {
              console.warn(`No S3 key found for deposit ${deposit.id}`);
              hasSlip = false;
            }
          } catch (error) {
            console.error(`Failed to generate signed URL for deposit ${deposit.id}:`, {
              error: error.message,
              stack: error.stack,
              slipUrl: deposit.slipUrl,
              metadata: deposit.metadata
            });
            // Fall back to direct S3 URL if available
            if (deposit.slipUrl) {
              slipViewUrl = deposit.slipUrl;
              // Ensure fallback URL is absolute
              if (!slipViewUrl.startsWith('http')) {
                slipViewUrl = `https://${slipViewUrl}`;
              }
              hasSlip = true;
              console.log('Using fallback S3 URL:', slipViewUrl);
            } else {
              hasSlip = false;
            }
          }
        } else if (deposit.slipUrl) {
          // Local file or direct URL
          hasSlip = true;
        }

        return {
          ...deposit,
          slipViewUrl, // URL for viewing the slip (signed URL for S3, local path for local)
          uploadMethod: isUsingS3() ? 's3' : 'local',
          hasSlip
        };
      })
    );

    res.json({ deposits: processedDeposits });
  } catch (err) {
    console.error('❌ Error fetching deposits:', err);
    logError(err, { context: 'admin_get_deposits' });
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
};

// ✅ Approve deposit and update user balance
export const approveDeposit = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Get the deposit with user info
    const deposit = await prisma.manualDeposit.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true
      }
    });

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    if (deposit.status === 'approved') {
      return res.status(400).json({ error: 'Deposit already approved' });
    }

    // Step 2: Update deposit status
    const updatedDeposit = await prisma.manualDeposit.update({
      where: { id: parseInt(id) },
      data: {
        verified: true,
        status: 'approved',
        approvedAt: new Date()
      }
    });

    // Step 3: Find user and update balance
    let user = deposit.user;
    if (!user) {
      // Fallback: find user by name if not found via relation
      user = await prisma.user.findUnique({
        where: { name: deposit.name }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 4: Update user's balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + deposit.amount
      }
    });

    // Log successful approval
    console.log(`✅ Deposit approved:`, {
      depositId: deposit.id,
      userId: user.id,
      amount: deposit.amount,
      newBalance: updatedUser.balance,
      utr: deposit.utr
    });

    res.json({ 
      message: '✅ Deposit approved and balance updated', 
      deposit: updatedDeposit,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        newBalance: updatedUser.balance
      }
    });

  } catch (err) {
    console.error('❌ Error approving deposit:', err);
    logError(err, { 
      context: 'admin_verify_deposit',
      depositId: id 
    });
    res.status(500).json({ error: 'Verification failed' });
  }
};

// ✅ Reject deposit
export const rejectDeposit = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const deposit = await prisma.manualDeposit.update({
      where: { id: parseInt(id) },
      data: {
        verified: false,
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      }
    });

    // Log rejection
    console.log(`❌ Deposit rejected:`, {
      depositId: deposit.id,
      amount: deposit.amount,
      utr: deposit.utr,
      reason: reason || 'No reason provided'
    });

    res.json({ 
      message: '❌ Deposit rejected', 
      deposit,
      reason: reason || 'No reason provided'
    });

  } catch (err) {
    console.error('❌ Error rejecting deposit:', err);
    logError(err, { 
      context: 'admin_reject_deposit',
      depositId: id 
    });
    res.status(500).json({ error: 'Rejection failed' });
  }
};

// ✅ Get deposit details with transaction slip
export const getDepositDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const deposit = await prisma.manualDeposit.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
            balance: true
          }
        }
      }
    });

    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    let slipViewUrl = deposit.slipUrl;
    let hasSlip = false;
    let uploadMethod = 'local';
    
    // If using S3 and deposit has a slip URL
    if (isUsingS3() && deposit.slipUrl) {
      try {
        // First, try to get S3 key from metadata if available
        let key = deposit.metadata?.s3Key;
        
        if (!key) {
          // Fallback: Extract key from S3 URL
          key = extractS3KeyFromUrl(deposit.slipUrl);
        }
        
        if (key) {
          console.log('Generating signed URL for deposit details:', {
            depositId: deposit.id,
            s3Key: key,
            originalUrl: deposit.slipUrl
          });
          
          // Generate signed URL for S3
          slipViewUrl = await getSlipSignedUrl(key, 3600); // 1 hour expiry
          
          // Ensure the URL is absolute (starts with http:// or https://)
          if (slipViewUrl && !slipViewUrl.startsWith('http')) {
            console.warn(`Generated signed URL is not absolute: ${slipViewUrl}`);
            slipViewUrl = `https://${slipViewUrl}`;
          }
          
          console.log('Final slip view URL for details:', {
            depositId: deposit.id,
            originalUrl: deposit.slipUrl,
            signedUrl: slipViewUrl,
            isAbsolute: slipViewUrl?.startsWith('http')
          });
          hasSlip = true;
          uploadMethod = 's3';
          
          console.log('Generated signed URL for deposit:', {
            depositId: deposit.id,
            originalUrl: deposit.slipUrl,
            key,
            signedUrl: slipViewUrl ? 'Generated successfully' : 'Failed to generate'
          });
        } else {
          console.warn(`No S3 key found for deposit ${deposit.id}`);
          hasSlip = false;
        }
      } catch (error) {
        console.error('Error generating signed URL:', {
          error: error.message,
          stack: error.stack,
          depositId: deposit.id,
          slipUrl: deposit.slipUrl,
          metadata: deposit.metadata
        });
        // Fall back to direct URL if available
        hasSlip = !!deposit.slipUrl;
      }
    } else if (deposit.slipUrl) {
      // Local file or direct URL
      hasSlip = true;
      slipViewUrl = deposit.slipUrl;
    }

    const response = {
      ...deposit,
      slipViewUrl,
      uploadMethod: deposit.metadata?.uploadMethod || uploadMethod,
      hasSlip,
      // Include the original URL for debugging
      _debug: {
        originalSlipUrl: deposit.slipUrl,
        isUsingS3: isUsingS3()
      }
    };
    
    console.log('Returning deposit details:', {
      depositId: deposit.id,
      hasSlip: response.hasSlip,
      uploadMethod: response.uploadMethod,
      slipViewUrl: response.slipViewUrl ? 'URL present' : 'No URL',
      originalUrl: deposit.slipUrl
    });
    
    return res.json(response);

  } catch (err) {
    console.error('❌ Error fetching deposit details:', err);
    logError(err, { 
      context: 'admin_get_deposit_details',
      depositId: id 
    });
    res.status(500).json({ error: 'Failed to fetch deposit details' });
  }
};

