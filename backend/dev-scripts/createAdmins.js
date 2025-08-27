// Script to create admin users with hashed passwords using Prisma
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Admin user configuration - CHANGE THESE CREDENTIALS BEFORE DEPLOYMENT!
const admins = [
  { 
    username: 'admin',           // Change this to your desired username
    password: 'Admin@123'        // Change this to a strong password
  },
  // Add more admin users if needed
  // { username: 'admin2', password: 'AnotherSecurePass123!' }
];

async function main() {
  console.log('Starting admin initialization...');
  
  for (const admin of admins) {
    try {
      // Check if admin already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { username: admin.username }
      });

      if (existingAdmin) {
        console.log(`ℹ️ Admin already exists: ${admin.username}`);
        continue;
      }

      // Create new admin
      const hashed = await bcrypt.hash(admin.password, 10);
      await prisma.admin.create({
        data: {
          username: admin.username,
          password: hashed
        },
      });
      
      console.log(`✅ Created admin: ${admin.username}`);
      if (admin.password === 'Admin@123') {
        console.warn('⚠️  WARNING: Using default password!');
        console.warn('⚠️  IMPORTANT: Change the admin password immediately after first login!');
      }
      
    } catch (error) {
      console.error(`❌ Error creating admin ${admin.username}:`, error.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
