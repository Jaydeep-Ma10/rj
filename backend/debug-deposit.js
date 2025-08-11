// Debug script to test deposit functionality directly
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const prisma = new PrismaClient();

async function testDepositEndpoint() {
  console.log('🔍 Testing deposit endpoint...');
  
  try {
    // Test 1: Check if ManualDeposit table exists
    console.log('\n1. Testing ManualDeposit table access...');
    const depositCount = await prisma.manualDeposit.count();
    console.log(`✅ ManualDeposit table accessible, current count: ${depositCount}`);
    
    // Test 2: Check if FileUpload table exists
    console.log('\n2. Testing FileUpload table access...');
    const fileCount = await prisma.fileUpload.count();
    console.log(`✅ FileUpload table accessible, current count: ${fileCount}`);
    
    // Test 3: Test deposit endpoint with minimal data
    console.log('\n3. Testing deposit endpoint...');
    const formData = new FormData();
    formData.append('name', 'boxx');
    formData.append('mobile', '8530226602');
    formData.append('amount', '20000');
    formData.append('utr', '1000');
    formData.append('method', 'Google Pay');
    
    const response = await fetch('https://rj-755j.onrender.com/api/manual-deposit', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText}`);
    
    if (!response.ok) {
      console.error('❌ Deposit endpoint failed');
      console.error('Response:', responseText);
    } else {
      console.log('✅ Deposit endpoint working!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDepositEndpoint();
