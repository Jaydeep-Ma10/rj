// Test script for admin system functionality
import axios from 'axios';
import { getAllAdmins, verifyAdminCredentials, initializeAdminUsers } from './services/adminUserService.js';

const BASE_URL = 'http://localhost:5000';

// Test admin credentials from .env
const testCredentials = [
  { username: 'admin', password: 'Admin@123' },
  { username: 'demouser1', password: 'Demo@123' },
  { username: 'demouser5', password: 'Demo@123' },
  { username: 'demouser10', password: 'Demo@123' },
  { username: 'demouser20', password: 'Demo@123' }
];

async function testAdminInitialization() {
  console.log('🧪 Testing Admin Initialization...\n');
  
  try {
    const result = await initializeAdminUsers();
    console.log(`✅ Admin initialization: ${result.created} created, ${result.existing} existing, ${result.total} total\n`);
    return true;
  } catch (error) {
    console.error('❌ Admin initialization failed:', error.message);
    return false;
  }
}

async function testAdminCredentials() {
  console.log('🔐 Testing Admin Credentials...\n');
  
  for (const cred of testCredentials) {
    try {
      const result = await verifyAdminCredentials(cred.username, cred.password);
      if (result.valid) {
        console.log(`✅ ${cred.username}: Valid credentials`);
      } else {
        console.log(`❌ ${cred.username}: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ ${cred.username}: Error - ${error.message}`);
    }
  }
  console.log('');
}

async function testAdminLogin() {
  console.log('🌐 Testing Admin Login API...\n');
  
  for (const cred of testCredentials.slice(0, 3)) { // Test first 3 only
    try {
      const response = await axios.post(`${BASE_URL}/admin/login`, {
        username: cred.username,
        password: cred.password
      });
      
      if (response.data.token) {
        console.log(`✅ ${cred.username}: Login successful, token received`);
      } else {
        console.log(`❌ ${cred.username}: Login failed - no token`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${cred.username}: ${error.response.status} - ${error.response.data.error || 'Login failed'}`);
      } else {
        console.log(`❌ ${cred.username}: Network error - ${error.message}`);
      }
    }
  }
  console.log('');
}

async function testAdminManagementAPI() {
  console.log('📊 Testing Admin Management API...\n');
  
  try {
    // First login as admin to get token
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'Admin@123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test admin list endpoint
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/admin-management/list`, { headers });
      console.log(`✅ Admin list: ${listResponse.data.count} admins found`);
    } catch (error) {
      console.log(`❌ Admin list failed: ${error.response?.data?.error || error.message}`);
    }
    
    // Test admin stats endpoint
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/admin-management/stats`, { headers });
      console.log(`✅ Admin stats: ${JSON.stringify(statsResponse.data.stats, null, 2)}`);
    } catch (error) {
      console.log(`❌ Admin stats failed: ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Admin management test failed: ${error.response?.data?.error || error.message}`);
  }
  console.log('');
}

async function testDepositApprovalFlow() {
  console.log('💰 Testing Deposit Approval Flow...\n');
  
  try {
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'demouser1',
      password: 'Demo@123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test getting deposits
    try {
      const depositsResponse = await axios.get(`${BASE_URL}/api/deposits`, { headers });
      console.log(`✅ Deposits fetch: ${depositsResponse.data.deposits?.length || 0} deposits found`);
    } catch (error) {
      console.log(`❌ Deposits fetch failed: ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Deposit approval test failed: ${error.response?.data?.error || error.message}`);
  }
  console.log('');
}

async function runAllTests() {
  console.log('🚀 Starting Admin System Tests\n');
  console.log('=' .repeat(50));
  
  // Test 1: Admin Initialization
  const initSuccess = await testAdminInitialization();
  
  if (initSuccess) {
    // Test 2: Credential Verification
    await testAdminCredentials();
    
    // Test 3: Admin Login API
    await testAdminLogin();
    
    // Test 4: Admin Management API
    await testAdminManagementAPI();
    
    // Test 5: Deposit Approval Flow
    await testDepositApprovalFlow();
  }
  
  console.log('=' .repeat(50));
  console.log('🏁 Admin System Tests Complete\n');
  
  // Display all admins
  try {
    const allAdmins = await getAllAdmins();
    console.log('👥 Current Admin Users:');
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.username} (ID: ${admin.id}) - Created: ${admin.createdAt.toISOString()}`);
    });
  } catch (error) {
    console.error('❌ Failed to fetch admin list:', error.message);
  }
}

// Run tests
runAllTests().catch(console.error);
