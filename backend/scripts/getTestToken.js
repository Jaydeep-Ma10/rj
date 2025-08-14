import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';

async function getTestToken() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Searching for test user...');
    
    // Find the test user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: 'FileUploadUser' },
          { mobile: '9876543210' }
        ]
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        balance: true
      }
    });

    if (!user) {
      console.error('❌ Test user not found. Creating test user...');
      
      // Create test user if not exists
      const newUser = await prisma.user.create({
        data: {
          name: 'TestUser',
          mobile: '9876543210',
          password: '$2a$10$XFDq3wGh9Ux8e5g5Z5Xk5uJzQqZ8X1XxXxXxXxXxXxXxXxXxXxXx', // hashed 'test123'
          balance: 1000,
          referralCode: 'TEST' + Math.floor(1000 + Math.random() * 9000)
        },
        select: {
          id: true,
          name: true,
          mobile: true,
          balance: true
        }
      });
      
      console.log('✅ Created test user with ID:', newUser.id);
      user = newUser;
    }

    console.log('\n🔍 User Details:');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Mobile: ${user.mobile}`);
    console.log(`Balance: ${user.balance}`);

    // Create token payload matching what auth middleware expects
    const tokenPayload = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      balance: user.balance
    };

    // Create token
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

    console.log('\n🔑 JWT Token:');
    console.log('--- START TOKEN ---');
    console.log(token);
    console.log('--- END TOKEN ---\n');
    console.log('📝 Use this token in the Authorization header as: "Bearer <token>"');
    console.log('Example:');
    console.log('Authorization: Bearer ' + token);

    return token;
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Error meta:', error.meta);
    throw error;
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}

// Run the function
getTestToken()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
