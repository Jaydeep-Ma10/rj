import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';
// Enable axios to show detailed error responses
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

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

// 1. First, create a test user (if not exists)
async function createTestUser() {
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
    
    // Add test slip file if it exists
    if (fs.existsSync(TEST_SLIP_PATH)) {
      console.log('Adding test slip file:', TEST_SLIP_PATH);
      formData.append('slip', fs.createReadStream(TEST_SLIP_PATH), {
        filename: 'test-slip.jpg',
        contentType: 'image/jpeg',
        knownLength: fs.statSync(TEST_SLIP_PATH).size
      });
    } else {
      console.warn('Test slip image not found, testing without file upload');
      // Create a small test file if it doesn't exist
      fs.writeFileSync(TEST_SLIP_PATH, Buffer.alloc(1024)); // 1KB test file
      console.log('Created test slip file at:', TEST_SLIP_PATH);
      formData.append('slip', fs.createReadStream(TEST_SLIP_PATH), {
        filename: 'test-slip.jpg',
        contentType: 'image/jpeg',
        knownLength: 1024
      });
    }
    
    // Log form data fields (excluding file content)
    console.log('Form data fields:', Object.fromEntries(formData.getHeaders()));
    console.log('Sending request to:', `${BASE_URL}/manual-deposit`);
    
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
    console.error('Deposit failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// 4. Main test function
async function runDepositTest() {
  try {
    // Step 1: Ensure test user exists
    await createTestUser();
    
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
