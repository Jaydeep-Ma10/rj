// Test script for mobile-based authentication
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Mobile-Based Authentication API\n');

  // Test 1: Create a new user with mobile number
  console.log('1️⃣ Testing Signup with Mobile Number...');
  try {
    const signupResponse = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'MobileTestUser',
        mobile: '9999888877',
        password: 'TestPassword123'
      })
    });

    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('✅ Signup successful!');
      console.log('User:', signupData.user);
      console.log('Token received:', signupData.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Signup failed:', signupData.error);
      
      // If user already exists, that's fine for testing
      if (signupData.error.includes('already exists')) {
        console.log('ℹ️  User already exists, proceeding with login test...');
      }
    }
  } catch (error) {
    console.log('❌ Signup request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Login with mobile number
  console.log('2️⃣ Testing Login with Mobile Number...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: '9999888877',
        password: 'TestPassword123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('User:', loginData.user);
      console.log('Token received:', loginData.token ? 'Yes' : 'No');
      
      // Store token for further tests
      const authToken = loginData.token;
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Test 3: Access user profile with mobile
      console.log('3️⃣ Testing User Profile Access with Mobile...');
      try {
        const profileResponse = await fetch(`${BASE_URL.replace('/api', '')}/user/${loginData.user.mobile}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        const profileData = await profileResponse.json();
        
        if (profileResponse.ok) {
          console.log('✅ Profile access successful!');
          console.log('Profile data:', profileData.user);
        } else {
          console.log('❌ Profile access failed:', profileData.error);
        }
      } catch (error) {
        console.log('❌ Profile request failed:', error.message);
      }

      console.log('\n' + '='.repeat(50) + '\n');
      
      // Test 4: Access user balance with mobile
      console.log('4️⃣ Testing User Balance Access with Mobile...');
      try {
        const balanceResponse = await fetch(`${BASE_URL.replace('/api', '')}/user/${loginData.user.mobile}/balance`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        const balanceData = await balanceResponse.json();
        
        if (balanceResponse.ok) {
          console.log('✅ Balance access successful!');
          console.log('Balance:', balanceData.balance);
        } else {
          console.log('❌ Balance access failed:', balanceData.error);
        }
      } catch (error) {
        console.log('❌ Balance request failed:', error.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.log('❌ Login request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Try login with old name-based format (should fail)
  console.log('5️⃣ Testing Old Name-Based Login (Should Fail)...');
  try {
    const oldLoginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'MobileTestUser',  // Using old 'name' field
        password: 'TestPassword123'
      })
    });

    const oldLoginData = await oldLoginResponse.json();
    
    if (oldLoginResponse.ok) {
      console.log('❌ Old login format unexpectedly succeeded! This indicates the migration wasn\'t complete.');
    } else {
      console.log('✅ Old login format correctly failed:', oldLoginData.error);
      console.log('ℹ️  This confirms the migration to mobile-based auth is working!');
    }
  } catch (error) {
    console.log('❌ Old login request failed:', error.message);
  }

  console.log('\n' + '🎉 Mobile Authentication API Testing Complete! 🎉');
}

// Run the tests
testAPI().catch(console.error);
