import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config({ path: '.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';
const PORT = process.env.PORT || 10000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to log with timestamps
const log = (...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]`, ...args);
};

// Function to generate a test JWT token
async function generateTestToken() {
  log('Initializing Prisma client...');
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
  
  try {
    // Test database connection first
    try {
      log('Testing database connection...');
      await prisma.$connect();
      log('✅ Database connection successful');
    } catch (dbError) {
      log('❌ Database connection failed:', dbError.message);
      if (dbError.code) log('Database error code:', dbError.code);
      if (dbError.meta) log('Database error meta:', dbError.meta);
      throw new Error('Failed to connect to database');
    }
    log('🔍 Searching for test user with mobile: 9876543210');
    
    // Find or create test user
    let user;
    try {
      log('Searching for existing test user...');
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
        log(`Found existing user: ${user.name} (ID: ${user.id}, Status: ${user.status})`);
      } else {
        log('No existing test user found, creating new one...');
      }
    } catch (findError) {
      log('❌ Error finding user:', findError.message);
      if (findError.code) log('Error code:', findError.code);
      if (findError.meta) log('Error meta:', findError.meta);
      throw findError;
    }

    if (!user) {
      try {
        log('ℹ️  Test user not found, creating new user...');
        const userData = {
          name: 'TestUser',
          mobile: '9876543210',
          password: '$2a$10$XFDq3wGh9Ux8e5g5Z5Xk5uJzQqZ8X1XxXxXxXxXxXxXxXxXxXxXx', // hashed 'test123'
          balance: 1000,
          status: 'ACTIVE',
          referralCode: 'TEST' + Math.floor(1000 + Math.random() * 9000)
        };
        
        log('Attempting to create user with data:', JSON.stringify(userData, null, 2));
        
        user = await prisma.user.create({
          data: userData,
          select: {
            id: true, 
            name: true, 
            mobile: true, 
            balance: true, 
            status: true
          }
        });
        
        log(`✅ Created test user with ID: ${user.id}`);
      } catch (createError) {
        log('❌ Error creating test user:', createError.message);
        if (createError.code) log('Error code:', createError.code);
        if (createError.meta) log('Error meta:', createError.meta);
        throw createError;
      }
    }

    // Create token payload matching auth middleware expectations
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        balance: user.balance
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    log('🔑 Generated JWT token');
    return token;
  } catch (error) {
    log('❌ Error generating test token:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Function to test /wingo/my-bets endpoint
async function testMyBetsEndpoint(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/wingo/my-bets?limit=10',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    log(`\n🌐 Making request to: ${BASE_URL}${options.path}`);
    log(`🔑 Using token: ${token.substring(0, 20)}...`);

    const req = http.request(options, (res) => {
      let data = [];
      
      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => {
        const response = Buffer.concat(data).toString();
        log(`\n=== RESPONSE (${res.statusCode} ${res.statusMessage}) ===`);
        log('Headers:', JSON.stringify(res.headers, null, 2));
        
        try {
          const json = JSON.parse(response);
          log('JSON Response:');
          console.log(JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          log('Raw Response:');
          console.log(response);
          resolve(response);
        }
      });
    });

    req.on('error', (error) => {
      log('❌ Request failed:', error);
      reject(error);
    });

    req.end();
  });
}

// Main function
async function main() {
  try {
    // 1. Generate test token
    const token = await generateTestToken();
    
    // 2. Test /wingo/my-bets endpoint with the token
    await testMyBetsEndpoint(token);
    
  } catch (error) {
    log('❌ Test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the main function
main();
