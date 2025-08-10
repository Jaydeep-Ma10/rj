import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkTestUser() {
  try {
    console.log('🔍 Checking test user...');
    
    const user = await prisma.user.findUnique({ 
      where: { name: 'TestUser' } 
    });
    
    if (!user) {
      console.log('❌ TestUser not found');
      return;
    }
    
    console.log('✅ TestUser found:', {
      name: user.name,
      mobile: user.mobile,
      hasPassword: !!user.password,
      balance: user.balance
    });
    
    // Test password verification
    const testPassword = 'Test@123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`🔐 Password "${testPassword}" is ${isValid ? 'VALID' : 'INVALID'}`);
    
    if (!isValid) {
      console.log('🔧 Updating password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { name: 'TestUser' },
        data: { password: hashedPassword }
      });
      console.log('✅ Password updated successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestUser();
