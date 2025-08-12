const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDeposit() {
  try {
    // Step 1: Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      name: 'TestUser',
      password: 'Test@123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');

    // Step 2: Test deposit without file
    console.log('\nTesting deposit without file...');
    const depositData = {
      name: 'TestUser',
      mobile: '9876543210',
      amount: 1000,
      utr: `TEST-${Date.now()}`,
      method: 'TEST'
    };

    const depositRes = await axios.post(
      `${API_URL}/manual-deposit`,
      depositData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Deposit successful:', depositRes.data);
    console.log('\n🎉 Test completed successfully!');
  } catch (error) {
    console.error('Test failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testDeposit();
