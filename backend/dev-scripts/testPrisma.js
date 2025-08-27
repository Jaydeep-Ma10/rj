// Minimal script to test Prisma client connection
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

// Helper function to log with timestamps
const log = (...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]`, ...args);
};

async function testPrisma() {
  log('Initializing Prisma client...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    // 1. Test database connection
    log('Testing database connection...');
    await prisma.$connect();
    log('✅ Database connection successful');

    // 2. Test a simple query
    log('Testing a simple query...');
    const userCount = await prisma.user.count();
    log(`✅ Found ${userCount} users in the database`);

    // 3. Try to find a specific user
    log('Searching for test user...');
    const testUser = await prisma.user.findFirst({
      where: { mobile: '9876543210' },
      select: { id: true, name: true, mobile: true }
    });

    if (testUser) {
      log(`✅ Found test user:`, testUser);
    } else {
      log('ℹ️  Test user not found');
    }

    return { success: true };
  } catch (error) {
    log('❌ Error:', error.message);
    if (error.code) log('Error code:', error.code);
    if (error.meta) log('Error meta:', error.meta);
    throw error;
  } finally {
    await prisma.$disconnect().catch(console.error);
    log('Disconnected from database');
  }
}

// Run the test
testPrisma()
  .then(() => {
    log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    log('Test failed with error:', error);
    process.exit(1);
  });
