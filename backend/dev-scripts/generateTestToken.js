import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';
const prisma = new PrismaClient();

async function generateTestToken() {
  try {
    // Find the test user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: 'FileUploadUser' },
          { mobile: '9876543210' }
        ]
      }
    });

    if (!user) {
      console.error('❌ Test user not found. Please run createFileUploadUser.js first.');
      process.exit(1);
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Test User Login Details:');
    console.log('Username: FileUploadUser');
    console.log('Password: Upload@123');
    console.log('\n🔑 JWT Token (use this in the test form):');
    console.log('\n--- START TOKEN ---');
    console.log(token);
    console.log('--- END TOKEN ---\n');
    console.log('📝 Copy the token between the markers and paste it when prompted in the test form.');

  } catch (error) {
    console.error('❌ Error generating test token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateTestToken();
