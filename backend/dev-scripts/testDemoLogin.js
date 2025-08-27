// scripts/testDemoLogin.js
import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';

async function testDemoLogin() {
  try {
    console.log('Testing demo user login...');
    
    // Get the demo user
    const user = await prisma.user.findUnique({
      where: { mobile: '9999000001' }
    });
    
    if (!user) {
      console.log('❌ Demo user not found');
      return;
    }
    
    console.log('✅ Demo user found:', {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      isDemoUser: user.isDemoUser,
      balance: user.balance
    });
    
    // Test password comparison
    const testPassword = '584288@Rj';
    console.log(`\nTesting password: "${testPassword}"`);
    
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match result:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
      
      // Let's check what the stored password hash looks like
      console.log('Stored password hash:', user.password);
      
      // Test with old password
      const oldPassword = 'demo123456';
      const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      console.log(`Old password "${oldPassword}" match:`, oldPasswordMatch);
      
      // Generate new hash for comparison
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('New hash for current password:', newHash);
    }
    
  } catch (error) {
    console.error('Error testing demo login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDemoLogin();
