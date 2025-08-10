import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { name: 'FileUploadUser' } 
    });
    
    console.log('FileUploadUser:', user ? 'EXISTS' : 'NOT FOUND');
    if (user) {
      console.log('User details:', {
        name: user.name,
        mobile: user.mobile,
        hasPassword: !!user.password
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
