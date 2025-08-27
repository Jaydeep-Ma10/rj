import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// CORS Configuration
const corsParams = {
  Bucket: process.env.AWS_S3_BUCKET_NAME || 'wingo-transaction-slips-1',
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'https://wingo-transaction-slips-1.s3.eu-north-1.amazonaws.com',
          'https://*.s3.eu-north-1.amazonaws.com',
          'https://*.amazonaws.com',
          'http://localhost:8080',
          'http://localhost:5000',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:3004',
          'http://localhost:3005'
        ],
        ExposeHeaders: [
          'x-amz-server-side-encryption',
          'x-amz-request-id',
          'x-amz-id-2',
          'ETag'
        ],
        MaxAgeSeconds: 3000,
      },
    ],
  },
};

async function configureCors() {
  try {
    console.log('🚀 Configuring CORS for S3 bucket:', corsParams.Bucket);
    console.log('📝 CORS Configuration:', JSON.stringify(corsParams, null, 2));
    
    // First, verify we can access the bucket
    console.log('🔍 Verifying bucket access...');
    const headBucketCommand = new HeadBucketCommand({ Bucket: corsParams.Bucket });
    await s3Client.send(headBucketCommand);
    console.log('✅ Bucket access verified');
    
    // Apply CORS configuration
    console.log('🔄 Applying CORS configuration...');
    const command = new PutBucketCorsCommand(corsParams);
    const response = await s3Client.send(command);
    
    console.log('✅ CORS configuration updated successfully');
    console.log('📋 Response:', JSON.stringify(response, null, 2));
    
    // Verify the CORS configuration
    console.log('🔍 Verifying CORS configuration...');
    const getCorsCommand = new GetBucketCorsCommand({ Bucket: corsParams.Bucket });
    const corsConfig = await s3Client.send(getCorsCommand);
    console.log('✅ Current CORS configuration:', JSON.stringify(corsConfig, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Error configuring CORS:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'NoSuchBucket') {
      console.error(`❌ Bucket "${corsParams.Bucket}" does not exist or you don't have permission to access it`);
    } else if (error.name === 'AccessDenied') {
      console.error('❌ Access denied. Please check your AWS credentials and permissions');
      console.error('Required IAM permission: s3:PutBucketCors');
    } else if (error.name === 'CredentialsProviderError') {
      console.error('❌ AWS credentials not found. Please check your .env file');
      console.error('Required environment variables:');
      console.error('- AWS_ACCESS_KEY_ID');
      console.error('- AWS_SECRET_ACCESS_KEY');
      console.error('- AWS_REGION (optional, defaults to us-east-1)');
      console.error('- AWS_S3_BUCKET_NAME (optional, defaults to wingo-transaction-slips-1)');
    }
    
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the configuration with proper error handling
(async () => {
  try {
    const success = await configureCors();
    if (success) {
      console.log('✨ CORS configuration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Clear your browser cache');
      console.log('2. Try accessing the images again');
      console.log('3. If issues persist, check the browser console for CORS errors');
    } else {
      console.log('❌ Failed to configure CORS. See error messages above.');
    }
  } catch (error) {
    console.error('❌ Unhandled error in CORS configuration:', error);
  }
})();
