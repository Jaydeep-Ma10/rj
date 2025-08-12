const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_USER = { name: 'TestUser', password: 'Test@123' };

// Test manual deposit
async function testDeposit() {
  try {
    // Login
    const login = await axios.post(`${API_BASE_URL}/auth/login`, {
      name: TEST_USER.name,
      password: TEST_USER.password
    });
    const token = login.data.token;
    console.log('Logged in successfully');

    // Test deposit without file
    const deposit1 = await axios.post(
      `${API_BASE_URL}/manual-deposit`,
      {
        name: TEST_USER.name,
        mobile: '9876543210',
        amount: 1000,
        utr: `TEST-${Date.now()}`,
        method: 'Bank Transfer'
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log('Deposit without file:', deposit1.data);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('Test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    process.exit(1);
  }
}

testDeposit();
