// Enable strict mode for better error handling
'use strict';

// Import required modules
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure environment variables
dotenv.config({ path: '.env' });

// Log environment variables for debugging
console.log('Environment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not Set'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Using default'}`);
console.log(`- PORT: ${process.env.PORT || '10000 (default)'}`);

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';
const PORT = process.env.PORT || 10000;
const BASE_URL = `http://localhost:${PORT}`;

// Log configuration
console.log('\nTest Configuration:');
console.log(`- Base URL: ${BASE_URL}`);
console.log(`- JWT Secret Length: ${JWT_SECRET.length} characters`);

// Helper function to log JSON with colors
const logJson = (label, obj) => {
  console.log(`\n${label}:`);
  console.log(JSON.stringify(obj, null, 2));
};

async function testMyBetsEndpoint() {
  console.log('\n🚀 Starting testMyBetsEndpoint...');
  
  // Initialize Prisma client with logging
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
  
  try {
    // 1. Find or create test user
    console.log('\n🔍 Setting up test user...');
    
    // First, check if database is accessible
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError.message);
      throw new Error('Failed to connect to database');
    }
    
    // Find existing user
    console.log('🔎 Searching for test user with mobile: 9876543210');
    let user;
    try {
      user = await prisma.user.findFirst({
        where: { 
          mobile: '9876543210' 
        },
        select: { 
          id: true, 
          name: true, 
          mobile: true, 
          balance: true,
          status: true
        }
      });
      
      if (user) {
        console.log(`✅ Found existing user: ${user.name} (ID: ${user.id})`);
        logJson('User Details', user);
      } else {
        console.log('ℹ️  Test user not found, creating new user...');
      }
    } catch (userError) {
      console.error('❌ Error finding user:', userError);
      throw userError;
    }

    if (!user) {
      console.log('\n👤 Creating new test user...');
      try {
        user = await prisma.user.create({
          data: {
            name: 'TestUser',
            mobile: '9876543210',
            password: '$2a$10$XFDq3wGh9Ux8e5g5Z5Xk5uJzQqZ8X1XxXxXxXxXxXxXxXxXxXxXx', // hashed 'test123'
            balance: 1000,
            status: 'ACTIVE',
            referralCode: 'TEST' + Math.floor(1000 + Math.random() * 9000)
          },
          select: {
            id: true,
            name: true,
            mobile: true,
            balance: true,
            status: true
          }
        });
        console.log(`✅ Created test user with ID: ${user.id}`);
        logJson('New User Details', user);
      } catch (createError) {
        console.error('❌ Error creating test user:', createError);
        throw createError;
      }
    }

    // 2. Generate JWT token
    console.log('\n🔑 Generating JWT token...');
    const token = jwt.sign(
      { 
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        balance: user.balance
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('\n--- JWT TOKEN ---');
    console.log(token);
    console.log('---------------\n');

    // 3. Test the /wingo/my-bets endpoint
    console.log('🚀 Testing /wingo/my-bets endpoint...');
    const url = `${BASE_URL}/wingo/my-bets?userId=${user.id}`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n--- RESPONSE ---');
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    try {
      const data = await response.json();
      console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (e) {
      const text = await response.text();
      console.log('Response Text:', text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Error meta:', error.meta);
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}

// Run the test
testMyBetsEndpoint()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
