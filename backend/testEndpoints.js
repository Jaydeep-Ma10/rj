// Simple test script to verify endpoints are working
import fetch from 'node-fetch';

async function testEndpoints() {
  console.log('🧪 Testing backend endpoints...\n');
  
  // Test 1: Health endpoint
  try {
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthResponse.status);
    console.log('📊 Health Data:', healthData);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Login endpoint
  try {
    console.log('2️⃣ Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'FileUploadUser',
        password: 'Upload@123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login Status:', loginResponse.status);
    console.log('🔐 Login Data:', loginData);
    
    if (loginData.token) {
      console.log('🎉 Login successful! Token received.');
      return loginData.token;
    }
  } catch (error) {
    console.log('❌ Login endpoint failed:', error.message);
  }
  
  return null;
}

testEndpoints();
