// scripts/checkDemoUsers.js
import { prisma } from '../prisma/client.js';

async function checkDemoUsers() {
  try {
    console.log('Checking demo users...');
    
    const demoUsers = await prisma.user.findMany({
      where: { 
        mobile: { 
          startsWith: '9999' 
        } 
      },
      select: { 
        id: true, 
        mobile: true, 
        name: true, 
        isDemoUser: true,
        balance: true,
        createdAt: true
      }
    });
    
    console.log(`Demo users found: ${demoUsers.length}`);
    
    if (demoUsers.length > 0) {
      console.log('\nDemo users list:');
      demoUsers.forEach(user => {
        console.log(`- ID: ${user.id}, Mobile: ${user.mobile}, Name: ${user.name}, isDemoUser: ${user.isDemoUser}, Balance: ${user.balance}`);
      });
    } else {
      console.log('No demo users found. They may not have been created yet.');
    }
    
    // Check if any user exists with the test mobile
    const testUser = await prisma.user.findUnique({
      where: { mobile: '9999000001' }
    });
    
    if (testUser) {
      console.log('\nTest user 9999000001 details:');
      console.log(`- ID: ${testUser.id}`);
      console.log(`- Name: ${testUser.name}`);
      console.log(`- Mobile: ${testUser.mobile}`);
      console.log(`- isDemoUser: ${testUser.isDemoUser}`);
      console.log(`- Balance: ${testUser.balance}`);
      console.log(`- Created: ${testUser.createdAt}`);
    } else {
      console.log('\nTest user 9999000001 not found');
    }
    
  } catch (error) {
    console.error('Error checking demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoUsers();
