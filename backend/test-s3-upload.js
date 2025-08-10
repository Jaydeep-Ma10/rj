import dotenv from 'dotenv';
import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if required environment variables are set
function checkEnv() {
  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.log('Please set these variables in your .env file or environment');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  logger: console // Enable debug logging
});

// Test S3 connection
async function testS3Connection() {
  try {
    console.log('\n🔍 Testing S3 connection...');
    const command = new ListBucketsCommand({});
    const data = await s3Client.send(command);
    
    console.log('✅ Successfully connected to S3');
    console.log('Available buckets:');
    data.Buckets.forEach(bucket => {
      console.log(`- ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to S3:', error.message);
    if (error.$metadata) {
      console.error('Request ID:', error.$metadata.requestId);
      console.error('HTTP Status Code:', error.$metadata.httpStatusCode);
    }
    return false;
  }
}

// Test file upload
async function testFileUpload() {
  const testFile = path.join(__dirname, 'test-upload.txt');
  const testContent = 'This is a test file for S3 upload at ' + new Date().toISOString();
  
  try {
    // Create a test file
    fs.writeFileSync(testFile, testContent);
    console.log(`\n📄 Created test file: ${testFile}`);
    
    // Upload the test file
    console.log('⬆️  Uploading test file to S3...');
    const key = `test-uploads/test-${Date.now()}.txt`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: fs.createReadStream(testFile),
      ContentType: 'text/plain',
      Metadata: {
        test: 'true',
        uploadedAt: new Date().toISOString()
      }
    };
    
    const command = new PutObjectCommand(uploadParams);
    const uploadResult = await s3Client.send(command);
    
    console.log('✅ File uploaded successfully');
    console.log('File Key:', key);
    console.log('ETag:', uploadResult.ETag);
    console.log('S3 URL:', `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`);
    
    return { success: true, key };
  } catch (error) {
    console.error('❌ File upload failed:', error.message);
    if (error.$metadata) {
      console.error('Request ID:', error.$metadata.requestId);
      console.error('HTTP Status Code:', error.$metadata.httpStatusCode);
    }
    return { success: false, error: error.message };
  } finally {
    // Clean up test file
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting S3 Upload Test\n');
  
  // Check environment
  if (!checkEnv()) {
    return;
  }
  
  // Test connection
  const connectionOk = await testS3Connection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed with file upload tests due to connection issues');
    return;
  }
  
  // Test file upload
  console.log('\n---\n');
  await testFileUpload();
  
  console.log('\n✅ All tests completed');
}

// Run the tests
runTests().catch(console.error);
