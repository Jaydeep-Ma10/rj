// Manual script to create 20 admin users for deposit approval
// Run this with: node create-admins-manual.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 21 admin users (1 main admin + 20 deposit approval admins)
const admins = [
  // Main admin
  { username: 'admin', password: 'Admin@123' },
  // 20 deposit approval admins
  { username: 'demouser1', password: 'Demo@123' },
  { username: 'demouser2', password: 'Demo@123' },
  { username: 'demouser3', password: 'Demo@123' },
  { username: 'demouser4', password: 'Demo@123' },
  { username: 'demouser5', password: 'Demo@123' },
  { username: 'demouser6', password: 'Demo@123' },
  { username: 'demouser7', password: 'Demo@123' },
  { username: 'demouser8', password: 'Demo@123' },
  { username: 'demouser9', password: 'Demo@123' },
  { username: 'demouser10', password: 'Demo@123' },
  { username: 'demouser11', password: 'Demo@123' },
  { username: 'demouser12', password: 'Demo@123' },
  { username: 'demouser13', password: 'Demo@123' },
  { username: 'demouser14', password: 'Demo@123' },
  { username: 'demouser15', password: 'Demo@123' },
  { username: 'demouser16', password: 'Demo@123' },
  { username: 'demouser17', password: 'Demo@123' },
  { username: 'demouser18', password: 'Demo@123' },
  { username: 'demouser19', password: 'Demo@123' },
  { username: 'demouser20', password: 'Demo@123' }
];

async function createAdmins() {
  console.log('🚀 Creating 21 admin users for deposit approval...\n');
  
  let created = 0;
  let existing = 0;
  
  for (const admin of admins) {
    try {
      // Check if admin already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { username: admin.username }
      });

      if (existingAdmin) {
        console.log(`ℹ️  Admin already exists: ${admin.username}`);
        existing++;
        continue;
      }

      // Create new admin with hashed password
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await prisma.admin.create({
        data: {
          username: admin.username,
          password: hashedPassword
        },
      });
      
      console.log(`✅ Created admin: ${admin.username}`);
      created++;
      
    } catch (error) {
      console.error(`❌ Error creating admin ${admin.username}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   • Created: ${created} admins`);
  console.log(`   • Already existed: ${existing} admins`);
  console.log(`   • Total admins: ${created + existing}`);
  
  // List all admins
  const allAdmins = await prisma.admin.findMany({
    select: { id: true, username: true, createdAt: true, lastLogin: true }
  });
  
  console.log(`\n👥 All Admin Users:`);
  allAdmins.forEach(admin => {
    console.log(`   • ${admin.username} (ID: ${admin.id}) - Created: ${admin.createdAt.toISOString()}`);
  });
  
  if (created > 0) {
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   • Main Admin: admin / Admin@123`);
    console.log(`   • Deposit Admins: demouser1-20 / Demo@123`);
    console.log(`\n⚠️  IMPORTANT: Change these default passwords in production!`);
  }
}

createAdmins()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
