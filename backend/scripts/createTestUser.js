import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating/updating test user...');
    
    // Check if user already exists by name or mobile
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: '8850291185' },
          { name: 'TestUser' }
        ]
      }
    });

    if (existingUser) {
      console.log('✅ Test user exists, updating mobile number...');
      
      // Update the existing user's mobile number
      const user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          mobile: '8850291185'
        }
      });
      
      console.log('✅ Test user updated successfully:');
      console.log('   Name:', user.name);
      console.log('   Mobile:', user.mobile);
      console.log('   Password: Test@123 (unchanged)');
      console.log('   Balance:', user.balance);
      
      return user;
    }

    // Create test user if doesn't exist
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'TestUser',
        mobile: '8850291185',
        password: hashedPassword,
        referralCode: 'TEST123',
        balance: 100.0
      }
    });

    console.log('✅ Test user created successfully:');
    console.log('   Name:', user.name);
    console.log('   Mobile:', user.mobile);
    console.log('   Password: Test@123');
    console.log('   Balance:', user.balance);
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser()
  .then(() => {
    console.log('🎉 Test user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create test user:', error);
    process.exit(1);
  });
