import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createFileUploadUser() {
  try {
    console.log('🚀 Creating fresh user for file upload testing...');
    
    const userName = 'FileUploadUser';
    const userPassword = 'Upload@123';
    const userMobile = '9876543210';
    
    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: {
        OR: [
          { name: userName },
          { mobile: userMobile }
        ]
      }
    });
    
    console.log('🧹 Cleaned up any existing user');
    
    // Create fresh user using the same logic as authController signup
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    
    // Generate unique referral code
    function generateReferralCode(length = 8) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
    
    let userReferralCode;
    let codeExists = true;
    while (codeExists) {
      userReferralCode = generateReferralCode();
      const existing = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
      codeExists = !!existing;
    }
    
    const user = await prisma.user.create({
      data: {
        name: userName,
        mobile: userMobile,
        password: hashedPassword,
        referralCode: userReferralCode,
        balance: 500.0 // Give some balance for testing
      },
    });
    
    console.log('✅ Fresh file upload user created successfully:');
    console.log('   👤 Name:', user.name);
    console.log('   📱 Mobile:', user.mobile);
    console.log('   🔐 Password:', userPassword);
    console.log('   💰 Balance:', user.balance);
    console.log('   🎫 Referral Code:', user.referralCode);
    
    // Test the password immediately
    const isValid = await bcrypt.compare(userPassword, user.password);
    console.log('   ✅ Password verification:', isValid ? 'VALID' : 'INVALID');
    
    return user;
    
  } catch (error) {
    console.error('❌ Error creating file upload user:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createFileUploadUser();
