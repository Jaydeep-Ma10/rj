// scripts/updateDemoPasswords.js
import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';

async function updateDemoPasswords() {
  try {
    console.log('Updating demo user passwords...');
    
    const newPassword = '584288@Rj';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log(`New password: "${newPassword}"`);
    console.log(`New hash: ${hashedPassword}`);
    
    // Update all demo users with new password
    const result = await prisma.user.updateMany({
      where: {
        mobile: {
          startsWith: '9999'
        },
        isDemoUser: true
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log(`✅ Updated ${result.count} demo users with new password`);
    
    // Verify the update worked
    const testUser = await prisma.user.findUnique({
      where: { mobile: '9999000001' }
    });
    
    if (testUser) {
      const passwordMatch = await bcrypt.compare(newPassword, testUser.password);
      console.log(`✅ Password verification for test user: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('Error updating demo passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDemoPasswords();
