import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';

async function generateUserToken() {
  try {
    // Find an active user in the database
    const user = await prisma.user.findFirst({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        id: 'asc'  // Get the first active user
      }
    });

    if (!user) {
      console.error('No active users found in the database');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (ID: ${user.id})`);

    // Create a token with the required userId field
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('\n✅ Generated User Token:');
    console.log(token);
    
    // Verify the token to ensure it's valid
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token verified successfully');
      console.log('Payload:', JSON.stringify(decoded, null, 2));
      
      // Save token to a file for easy use in test scripts
      const fs = require('fs');
      fs.writeFileSync('user-token.txt', token);
      console.log('\n✅ Token saved to user-token.txt');
      
    } catch (verifyError) {
      console.error('❌ Failed to verify generated token:', verifyError.message);
    }
    
  } catch (error) {
    console.error('Error generating token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateUserToken();
