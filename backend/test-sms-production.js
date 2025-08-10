#!/usr/bin/env node

/**
 * SMS Production Testing Script
 * 
 * This script helps test SMS provider integration before production deployment.
 * It validates configuration, tests SMS delivery, and provides performance metrics.
 */

import dotenv from 'dotenv';
import { sendOTPSMS, validateMobileNumber } from './utils/smsService.js';
import { prisma } from './prisma/client.js';

// Load environment variables
dotenv.config();

console.log('📱 SMS Production Testing Script\n');

// Test configuration
const TEST_CONFIG = {
  testMobiles: [
    '9876543210', // Replace with your test numbers
    '9123456789'
  ],
  providers: ['textlocal', 'fast2sms', 'twilio', 'aws', 'mock'],
  testOTP: '123456'
};

// Helper function to generate test OTP
function generateTestOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check SMS provider configuration
async function checkSMSConfiguration() {
  console.log('🔧 SMS Configuration Check:');
  
  const currentProvider = process.env.SMS_PROVIDER || 'mock';
  console.log(`- Current Provider: ${currentProvider}`);
  console.log(`- Node Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check provider-specific configurations
  const configs = {
    textlocal: {
      apiKey: process.env.TEXTLOCAL_API_KEY,
      sender: process.env.TEXTLOCAL_SENDER || 'WINGO'
    },
    fast2sms: {
      apiKey: process.env.FAST2SMS_API_KEY,
      sender: process.env.FAST2SMS_SENDER || 'WINGO'
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    }
  };
  
  if (configs[currentProvider]) {
    const config = configs[currentProvider];
    console.log(`\n${currentProvider.toUpperCase()} Configuration:`);
    
    Object.entries(config).forEach(([key, value]) => {
      if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
        console.log(`- ${key}: ${value ? '✅ Set' : '❌ Missing'}`);
      } else {
        console.log(`- ${key}: ${value || '❌ Missing'}`);
      }
    });
  }
  
  console.log();
}

// Test mobile number validation
async function testMobileValidation() {
  console.log('📞 Mobile Number Validation Test:');
  
  const testNumbers = [
    '9876543210',     // Valid Indian
    '+919876543210',  // Valid with country code
    '1234567890',     // Invalid (doesn't start with 6-9)
    '98765',          // Too short
    '98765432109876', // Too long
    'abcd123456'      // Invalid characters
  ];
  
  testNumbers.forEach(number => {
    const result = validateMobileNumber(number);
    console.log(`- ${number}: ${result.valid ? '✅ Valid' : '❌ Invalid'} ${result.error || ''}`);
  });
  
  console.log();
}

// Test SMS delivery with different providers
async function testSMSDelivery() {
  console.log('📤 SMS Delivery Test:');
  
  const testMobile = TEST_CONFIG.testMobiles[0];
  const testOTP = generateTestOTP();
  
  if (!testMobile) {
    console.log('❌ No test mobile number configured. Please add your mobile number to TEST_CONFIG.testMobiles');
    return;
  }
  
  try {
    console.log(`Sending test OTP to: ${testMobile}`);
    console.log(`Test OTP: ${testOTP}`);
    
    const startTime = Date.now();
    const result = await sendOTPSMS(testMobile, testOTP);
    const duration = Date.now() - startTime;
    
    console.log(`✅ SMS sent successfully!`);
    console.log(`- Provider: ${result.provider}`);
    console.log(`- Message ID: ${result.messageId}`);
    console.log(`- Duration: ${duration}ms`);
    
    if (result.provider === 'mock') {
      console.log('⚠️  Currently using MOCK provider. Check console output above for the OTP message.');
    }
    
  } catch (error) {
    console.log(`❌ SMS delivery failed: ${error.message}`);
  }
  
  console.log();
}

// Test password reset flow end-to-end
async function testPasswordResetFlow() {
  console.log('🔄 Password Reset Flow Test:');
  
  const testMobile = TEST_CONFIG.testMobiles[0];
  
  if (!testMobile) {
    console.log('❌ No test mobile number configured');
    return;
  }
  
  try {
    // Check if test user exists
    let testUser = await prisma.user.findFirst({
      where: { mobile: testMobile }
    });
    
    if (!testUser) {
      console.log('⚠️  Test user not found. Creating test user...');
      testUser = await prisma.user.create({
        data: {
          name: 'SMS Test User',
          mobile: testMobile,
          password: 'TempPassword123!',
          balance: 0,
          referralCode: `smstest-${Date.now()}`
        }
      });
      console.log(`✅ Test user created with ID: ${testUser.id}`);
    } else {
      console.log(`✅ Test user found with ID: ${testUser.id}`);
    }
    
    // Clean up any existing password reset records
    await prisma.passwordReset.deleteMany({
      where: { mobile: testMobile }
    });
    
    console.log('✅ Password reset flow test setup complete');
    console.log(`📱 You can now test the full flow at: http://localhost:5000/password-reset-test.html`);
    console.log(`📱 Or use API endpoints with mobile: ${testMobile}`);
    
  } catch (error) {
    console.log(`❌ Password reset flow test failed: ${error.message}`);
  }
  
  console.log();
}

// Performance and load testing
async function testSMSPerformance() {
  console.log('⚡ SMS Performance Test:');
  
  const testMobile = TEST_CONFIG.testMobiles[0];
  
  if (!testMobile) {
    console.log('❌ No test mobile number configured');
    return;
  }
  
  const testCount = 3;
  const results = [];
  
  console.log(`Sending ${testCount} test SMS messages...`);
  
  for (let i = 0; i < testCount; i++) {
    try {
      const testOTP = generateTestOTP();
      const startTime = Date.now();
      
      const result = await sendOTPSMS(testMobile, testOTP);
      const duration = Date.now() - startTime;
      
      results.push({
        attempt: i + 1,
        success: true,
        duration,
        provider: result.provider
      });
      
      console.log(`  ${i + 1}. ✅ Success (${duration}ms) - ${result.provider}`);
      
      // Wait 2 seconds between requests to avoid rate limiting
      if (i < testCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      results.push({
        attempt: i + 1,
        success: false,
        error: error.message
      });
      
      console.log(`  ${i + 1}. ❌ Failed - ${error.message}`);
    }
  }
  
  // Calculate performance metrics
  const successfulResults = results.filter(r => r.success);
  const successRate = (successfulResults.length / results.length) * 100;
  const avgDuration = successfulResults.length > 0 
    ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length 
    : 0;
  
  console.log(`\n📊 Performance Summary:`);
  console.log(`- Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`- Average Duration: ${avgDuration.toFixed(0)}ms`);
  console.log(`- Total Tests: ${results.length}`);
  console.log(`- Successful: ${successfulResults.length}`);
  console.log(`- Failed: ${results.length - successfulResults.length}`);
  
  console.log();
}

// Check database connectivity and schema
async function testDatabaseConnectivity() {
  console.log('🗄️  Database Connectivity Test:');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if PasswordReset table exists and has correct schema
    const passwordResetCount = await prisma.passwordReset.count();
    console.log(`✅ PasswordReset table accessible (${passwordResetCount} records)`);
    
    // Check if User table exists
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible (${userCount} records)`);
    
    // Test creating a dummy password reset record
    const testRecord = await prisma.passwordReset.create({
      data: {
        mobile: '0000000000',
        otp: 'test123',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false
      }
    });
    
    // Clean up test record
    await prisma.passwordReset.delete({
      where: { id: testRecord.id }
    });
    
    console.log('✅ Database write/delete operations successful');
    
  } catch (error) {
    console.log(`❌ Database test failed: ${error.message}`);
  }
  
  console.log();
}

// Generate production readiness report
async function generateProductionReport() {
  console.log('📋 Production Readiness Report:');
  
  const checks = [];
  
  // Check environment
  const isProduction = process.env.NODE_ENV === 'production';
  checks.push({
    item: 'Production Environment',
    status: isProduction,
    message: isProduction ? 'NODE_ENV=production' : 'NODE_ENV not set to production'
  });
  
  // Check SMS provider
  const hasRealProvider = process.env.SMS_PROVIDER && process.env.SMS_PROVIDER !== 'mock';
  checks.push({
    item: 'Real SMS Provider',
    status: hasRealProvider,
    message: hasRealProvider ? `Using ${process.env.SMS_PROVIDER}` : 'Still using mock provider'
  });
  
  // Check provider configuration
  const provider = process.env.SMS_PROVIDER;
  let hasProviderConfig = false;
  
  if (provider === 'textlocal' && process.env.TEXTLOCAL_API_KEY) hasProviderConfig = true;
  if (provider === 'fast2sms' && process.env.FAST2SMS_API_KEY) hasProviderConfig = true;
  if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) hasProviderConfig = true;
  if (provider === 'aws' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) hasProviderConfig = true;
  
  checks.push({
    item: 'Provider Configuration',
    status: hasProviderConfig,
    message: hasProviderConfig ? 'API credentials configured' : 'Missing API credentials'
  });
  
  // Check database
  let hasDatabase = false;
  try {
    await prisma.$connect();
    hasDatabase = true;
  } catch (error) {
    // Database check failed
  }
  
  checks.push({
    item: 'Database Connection',
    status: hasDatabase,
    message: hasDatabase ? 'Connected successfully' : 'Connection failed'
  });
  
  // Display results
  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${check.item}: ${check.message}`);
  });
  
  const passedChecks = checks.filter(c => c.status).length;
  const totalChecks = checks.length;
  
  console.log(`\n📊 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 System is PRODUCTION READY!');
  } else {
    console.log('⚠️  System needs configuration before production deployment');
  }
  
  console.log();
}

// Main test function
async function runSMSTests() {
  try {
    console.log('Starting comprehensive SMS/OTP system tests...\n');
    
    await checkSMSConfiguration();
    await testMobileValidation();
    await testDatabaseConnectivity();
    await testPasswordResetFlow();
    await testSMSDelivery();
    await testSMSPerformance();
    await generateProductionReport();
    
    console.log('✅ All SMS tests completed!');
    console.log('\n📚 Next Steps:');
    console.log('1. If using mock provider, set up a real SMS provider (see SMS_PRODUCTION_SETUP.md)');
    console.log('2. Test with your actual mobile number');
    console.log('3. Monitor SMS delivery rates in production');
    console.log('4. Set up alerting for SMS failures');
    console.log('5. Consider adding a backup SMS provider for redundancy');
    
  } catch (error) {
    console.error('❌ SMS test suite failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runSMSTests().catch(console.error);
