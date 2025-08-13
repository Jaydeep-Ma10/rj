const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  mobile: '+1234567890',  // Using existing test user
  name: 'Test User',
  password: 'testpassword123'  // Make sure this matches the existing user's password
};

// Test deposit data
const DEPOSIT_DATA = {
  name: 'Test User',
  mobile: '+1234567890',  // Must match the test user's mobile
  amount: '1000',
  utr: 'TEST' + Date.now(),
  method: 'BANK_TRANSFER'
};

// Path to a test slip image (create a small test image if needed)
const TEST_SLIP_PATH = path.join(__dirname, 'test-slip.jpg');

// 1. Check if test user exists
async function checkTestUser() {
  try {
    console.log('Checking if test user exists...');
    // Just log that we're using existing user
    console.log('Using existing test user with mobile:', TEST_USER.mobile);
    return true;
  } catch (error) {
    console.error('Error checking test user:', error.response?.data || error.message);
    throw error;
  }
}

// 2. Login and get JWT token
async function loginAndGetToken() {
  try {
    console.log('Logging in...');
    console.log('Trying to log in at:', `${BASE_URL}/login`);
    const response = await axios.post(`${BASE_URL}/login`, {
      mobile: TEST_USER.mobile,
      password: TEST_USER.password
    });
    
    console.log('Login successful');
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// 3. Test manual deposit
async function testManualDeposit(token) {
  try {
    console.log('\nTesting manual deposit...');
    
    // Create form data with deposit info and file
    const formData = new FormData();
    formData.append('name', DEPOSIT_DATA.name);
    formData.append('mobile', DEPOSIT_DATA.mobile);
    formData.append('amount', DEPOSIT_DATA.amount);
    formData.append('utr', DEPOSIT_DATA.utr);
    formData.append('method', DEPOSIT_DATA.method);
    
    // Create a test slip file if it doesn't exist
    if (!fs.existsSync(TEST_SLIP_PATH)) {
      console.log('Creating test slip file at:', TEST_SLIP_PATH);
      fs.writeFileSync(TEST_SLIP_PATH, Buffer.alloc(1024)); // 1KB test file
    }
    
    // Read the file synchronously to ensure it exists and is accessible
    const fileContent = fs.readFileSync(TEST_SLIP_PATH);
    console.log(`Test slip file size: ${fileContent.length} bytes`);
    
    // Add the file to form data using Buffer instead of stream
    formData.append('slip', fileContent, {
      filename: 'test-slip.jpg',
      contentType: 'image/jpeg',
      knownLength: fileContent.length
    });
    
    console.log('Sending request to:', `${BASE_URL}/manual-deposit`);
    
    // Log all form data parts for debugging
    console.log('=== REQUEST DEBUG INFO ===');
    console.log('Form data parts:');
    formData._streams.forEach((part, index) => {
      if (typeof part === 'string') {
        console.log(`[${index}] String: ${part.trim()}`);
      } else if (Buffer.isBuffer(part)) {
        console.log(`[${index}] Buffer: ${part.length} bytes`);
      } else if (part && typeof part === 'object') {
        console.log(`[${index}] Object:`, part);
      } else {
        console.log(`[${index}] Unknown type:`, typeof part);
      }
    });
    
    // Log request headers
    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${token}`,
      'Content-Length': formData.getLengthSync()
    };
    console.log('Request headers:', headers);
    
    // Log form data fields (excluding file content)
    console.log('Form data field names:');
    const fields = [];
    formData._streams.forEach(part => {
      if (typeof part === 'string') {
        const fieldMatch = part.match(/name="([^"]+)"/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          if (fieldName !== 'slip') {  // Skip file content
            fields.push(fieldName);
          }
        }
      }
    });
    console.log('Fields:', fields);
    console.log('==========================');
    
    const response = await axios.post(`${BASE_URL}/manual-deposit`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('Deposit successful:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Deposit failed with status:', error.response.status);
      console.error('Error details:', error.response.data);
      console.error('Response headers:', error.response.headers);
      if (error.response.data && error.response.data.error) {
        console.error('Server error message:', error.response.data.error);
      }
    } else if (error.request) {
      console.error('No response received. Request details:', {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data?.toString()
      });
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// 4. Main test function
async function runDepositTest() {
  try {
    // Step 1: Check test user
    await checkTestUser();
    
    // Step 2: Login to get token
    const token = await loginAndGetToken();
    
    // Step 3: Test deposit
    await testManualDeposit(token);
    
    console.log('\n✅ Deposit test completed successfully!');
  } catch (error) {
    console.error('\n❌ Deposit test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runDepositTest();
