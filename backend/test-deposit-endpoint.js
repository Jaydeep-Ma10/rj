// Simple test script for manual deposit endpoint
import axios from 'axios';

async function testDeposit() {
  try {
    // 1. Login to get JWT token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      name: 'TestUser',
      password: 'Test@123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful. Token obtained.');

    // 2. Test manual deposit endpoint
    console.log('\nTesting manual deposit endpoint...');
    const depositData = {
      name: 'TestUser',
      mobile: '9876543210',
      amount: 1000,
      utr: `TEST-${Date.now()}`,
      method: 'TEST'
    };

    console.log('Sending deposit request with data:', JSON.stringify(depositData, null, 2));

    const depositResponse = await axios.post(
      'http://localhost:5000/api/manual-deposit',
      depositData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Deposit request successful!');
    console.log('Response status:', depositResponse.status);
    console.log('Response data:', JSON.stringify(depositResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    console.error('Error config:', error.config);
  }
}

// Run the test
testDeposit();
