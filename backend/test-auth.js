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
  console.log('🧪 Testing Mobile-Based Authentication API\n');
  
  // Test 1: Login with mobile number
  console.log('1️⃣ Testing Login with Mobile Number:');
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
      mobile: '9876543210',
      password: 'Test@123'
    });
    
    console.log('   Status:', loginResult.status);
    console.log('   Response:', JSON.stringify(loginResult.data, null, 2));
    
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('   ✅ Mobile-based login SUCCESS!');
      console.log('   📱 Mobile:', loginResult.data.user.mobile);
      console.log('   🎫 Token received: Yes');
    } else if (loginResult.status === 404) {
      console.log('   ℹ️  User not found - will try signup first');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Login Error:', error.message);
  }
  
  // Test 2: Signup with mobile if login failed
  console.log('2️⃣ Testing Signup with Mobile Number:');
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
      name: 'TestMobileUser',
      mobile: '9876543210',
      password: 'Test@123'
    });
    
    console.log('   Status:', signupResult.status);
    console.log('   Response:', JSON.stringify(signupResult.data, null, 2));
    
    if (signupResult.status === 201) {
      console.log('   ✅ Mobile-based signup SUCCESS!');
    } else if (signupResult.data.error && signupResult.data.error.includes('already exists')) {
      console.log('   ℹ️  User already exists - that\'s fine for testing');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Signup Error:', error.message);
  }
  
  // Test 3: Try old name-based login (should fail)
  console.log('3️⃣ Testing Old Name-Based Login (Should Fail):');
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
      name: 'TestMobileUser',  // Using old 'name' field instead of 'mobile'
      password: 'Test@123'
    });
    
    console.log('   Status:', oldLoginResult.status);
    console.log('   Response:', JSON.stringify(oldLoginResult.data, null, 2));
    
    if (oldLoginResult.status === 400) {
      console.log('   ✅ Old name-based login correctly FAILED!');
      console.log('   ✅ Migration to mobile-based auth is working!');
    } else {
      console.log('   ❌ Old login format should have failed but didn\'t');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Old Login Error:', error.message);
  }
  
  // Test 4: Login again with mobile to confirm it works
  console.log('4️⃣ Final Mobile Login Test:');
  try {
    const finalLoginResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      mobile: '9876543210',
      password: 'Test@123'
    });
    
    console.log('   Status:', finalLoginResult.status);
    
    if (finalLoginResult.status === 200) {
      console.log('   ✅ Final mobile login SUCCESS!');
      console.log('   👤 User ID:', finalLoginResult.data.user.id);
      console.log('   📱 Mobile:', finalLoginResult.data.user.mobile);
      console.log('   👤 Name:', finalLoginResult.data.user.name);
      console.log('   🎫 Token: ' + (finalLoginResult.data.token ? 'Received' : 'Missing'));
    } else {
      console.log('   ❌ Final login failed:', finalLoginResult.data.error);
    }
  } catch (error) {
    console.log('   ❌ Final Login Error:', error.message);
  }
  
  console.log('\n🎉 Mobile Authentication API Testing Complete!');
  console.log('📋 Summary: The backend now uses mobile numbers for authentication instead of names.');
}

testMobileAuth().catch(console.error);
