// Simple test for mobile-based authentication
const https = require('https');
const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testMobileAuth() {
  console.log('Testing Mobile-Based Authentication...\n');
  
  // Test 1: Signup with mobile
  console.log('1. Testing Signup with Mobile Number:');
  try {
    const signupResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'TestMobile',
      mobile: '9876543211',
      password: 'Test123!'
    });
    
    console.log('Status:', signupResult.status);
    console.log('Response:', signupResult.data);
    console.log('');
  } catch (error) {
    console.log('Signup Error:', error.message);
  }
  
  // Test 2: Login with mobile
  console.log('2. Testing Login with Mobile Number:');
  try {
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      mobile: '9876543211',
      password: 'Test123!'
    });
    
    console.log('Status:', loginResult.status);
    console.log('Response:', loginResult.data);
    console.log('');
    
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('✅ Mobile-based login SUCCESS!');
      console.log('Token received:', loginResult.data.token.substring(0, 20) + '...');
      console.log('User data:', loginResult.data.user);
    }
  } catch (error) {
    console.log('Login Error:', error.message);
  }
  
  // Test 3: Try old name-based login (should fail)
  console.log('3. Testing Old Name-Based Login (Should Fail):');
  try {
    const oldLoginResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'TestMobile',  // Using old 'name' field
      password: 'Test123!'
    });
    
    console.log('Status:', oldLoginResult.status);
    console.log('Response:', oldLoginResult.data);
    
    if (oldLoginResult.status !== 200) {
      console.log('✅ Old name-based login correctly FAILED!');
      console.log('✅ Migration to mobile-based auth is working!');
    }
  } catch (error) {
    console.log('Old Login Error:', error.message);
  }
}

testMobileAuth();
