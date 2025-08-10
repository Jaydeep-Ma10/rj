#!/usr/bin/env node

/**
 * S3 Admin Debug Script
 * 
 * This script helps debug S3 integration issues by:
 * 1. Testing S3 connection and configuration
 * 2. Checking existing deposits and their S3 metadata
 * 3. Testing signed URL generation
 * 4. Identifying and fixing common issues
 */

import dotenv from 'dotenv';
import { prisma } from './prisma/client.js';
import { getSlipSignedUrl, isUsingS3, isS3Configured } from './services/s3TransactionSlipService.js';

// Load environment variables
dotenv.config();

console.log('🔍 S3 Admin Debug Script Starting...\n');

// Helper function to extract S3 key from URL (same as in adminController)
function extractS3KeyFromUrl(url) {
  if (!url) return null;
  
  try {
    // If it's already a key (no protocol), return as is
    if (!url.startsWith('http')) {
      return url.startsWith('/') ? url.substring(1) : url;
    }
    
    // Parse the URL
    const parsedUrl = new URL(url);
    let pathname = parsedUrl.pathname;
    
    // Remove leading slash
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }
    
    // For S3 URLs, the key is everything after the bucket name
    if (parsedUrl.hostname.includes('amazonaws.com')) {
      const pathParts = pathname.split('/');
      
      if (parsedUrl.hostname.startsWith('s3.') || parsedUrl.hostname.includes('.s3.')) {
        // Format 1: bucket in hostname, key is full pathname
        return decodeURIComponent(pathname);
      } else {
        // Format 2: bucket in path, remove first part
        pathParts.shift(); // Remove bucket name
        return decodeURIComponent(pathParts.join('/'));
      }
    }
    
    // For other URLs, return the pathname
    return decodeURIComponent(pathname);
  } catch (error) {
    console.error('Error extracting S3 key from URL:', { url, error: error.message });
    return null;
  }
}

async function checkS3Configuration() {
  console.log('📋 S3 Configuration Check:');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('- AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME ? `✅ Set (${process.env.AWS_S3_BUCKET_NAME})` : '❌ Missing');
  console.log('- AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
  console.log('- S3 Configured:', isS3Configured() ? '✅ Yes' : '❌ No');
  console.log('- Using S3:', isUsingS3() ? '✅ Yes' : '❌ No (using local storage)');
  console.log();
}

async function analyzeDeposits() {
  console.log('📊 Analyzing Existing Deposits:');
  
  try {
    const deposits = await prisma.manualDeposit.findMany({
      where: {
        slipUrl: {
          not: null
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Analyze last 10 deposits
    });

    console.log(`Found ${deposits.length} deposits with slip URLs\n`);

    for (const deposit of deposits) {
      console.log(`🔍 Deposit ID: ${deposit.id}`);
      console.log(`   Created: ${deposit.createdAt}`);
      console.log(`   Amount: $${deposit.amount}`);
      console.log(`   Status: ${deposit.status}`);
      console.log(`   Slip URL: ${deposit.slipUrl}`);
      console.log(`   Metadata: ${JSON.stringify(deposit.metadata, null, 2)}`);
      
      // Try to extract S3 key
      let s3Key = deposit.metadata?.s3Key;
      if (!s3Key) {
        s3Key = extractS3KeyFromUrl(deposit.slipUrl);
      }
      
      console.log(`   Extracted S3 Key: ${s3Key || 'None'}`);
      
      // Test signed URL generation if using S3
      if (isUsingS3() && s3Key) {
        try {
          const signedUrl = await getSlipSignedUrl(s3Key, 300); // 5 minute expiry for testing
          console.log(`   Signed URL: ${signedUrl ? '✅ Generated successfully' : '❌ Failed to generate'}`);
          if (signedUrl) {
            console.log(`   URL Preview: ${signedUrl.substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`   Signed URL Error: ❌ ${error.message}`);
        }
      } else if (!isUsingS3()) {
        console.log(`   Local File: ${deposit.slipUrl}`);
      }
      
      console.log('   ---');
    }
  } catch (error) {
    console.error('❌ Error analyzing deposits:', error.message);
  }
}

async function testSignedUrlGeneration() {
  if (!isUsingS3()) {
    console.log('⚠️ Skipping signed URL tests - S3 not configured');
    return;
  }

  console.log('\n🧪 Testing Signed URL Generation:');
  
  // Test with a sample key
  const testKeys = [
    'transaction-slips/1/1704067200000-test.jpg',
    'transaction-slips/test-user/sample-receipt.png',
    'test-uploads/sample.pdf'
  ];

  for (const key of testKeys) {
    try {
      console.log(`Testing key: ${key}`);
      const signedUrl = await getSlipSignedUrl(key, 300);
      console.log(`Result: ${signedUrl ? '✅ Success' : '❌ Failed'}`);
      if (signedUrl) {
        console.log(`URL: ${signedUrl.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`Result: ❌ Error - ${error.message}`);
    }
    console.log('---');
  }
}

async function identifyIssues() {
  console.log('\n🔧 Issue Identification:');
  
  const issues = [];
  
  // Check S3 configuration
  if (!isS3Configured()) {
    issues.push('S3 not configured - using local storage fallback');
  }
  
  // Check for deposits with missing S3 keys
  try {
    const depositsWithS3Urls = await prisma.manualDeposit.findMany({
      where: {
        slipUrl: {
          contains: 'amazonaws.com'
        }
      }
    });
    
    const depositsWithoutS3Keys = depositsWithS3Urls.filter(d => !d.metadata?.s3Key);
    
    if (depositsWithoutS3Keys.length > 0) {
      issues.push(`${depositsWithoutS3Keys.length} deposits have S3 URLs but missing S3 keys in metadata`);
    }
  } catch (error) {
    issues.push(`Database query error: ${error.message}`);
  }
  
  if (issues.length === 0) {
    console.log('✅ No obvious issues detected');
  } else {
    console.log('❌ Issues found:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
}

async function suggestFixes() {
  console.log('\n💡 Suggested Fixes:');
  
  if (!isS3Configured()) {
    console.log('1. Configure S3 by setting AWS environment variables in .env file');
    console.log('2. Restart the server after configuration');
    return;
  }
  
  console.log('1. ✅ Fixed critical bug in manualDepositController.js (wrong variables used for S3 metadata)');
  console.log('2. ✅ Improved admin controller S3 key extraction logic');
  console.log('3. ✅ Added better error logging for debugging');
  console.log('4. 🔄 Restart the server to apply fixes');
  console.log('5. 🧪 Test with a new file upload to verify fixes work');
  console.log('6. 📊 Check server logs for detailed error messages if issues persist');
}

async function main() {
  try {
    await checkS3Configuration();
    await analyzeDeposits();
    await testSignedUrlGeneration();
    await identifyIssues();
    await suggestFixes();
    
    console.log('\n✅ Debug analysis complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your server: npm start');
    console.log('2. Test file upload using: http://localhost:5000/transaction-slip-test.html');
    console.log('3. Check admin panel to see if images display correctly');
    console.log('4. Monitor server logs for any remaining errors');
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug script
main().catch(console.error);
