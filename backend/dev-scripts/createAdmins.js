// Script to create admin users with hashed passwords using Prisma
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Load admin configuration from environment variables
function loadAdminConfig() {
  const adminUsersEnabled = process.env.ADMIN_USERS_ENABLED === 'true';
  
  if (!adminUsersEnabled) {
    // Fallback to single admin if env config disabled
    return [{ username: 'admin', password: 'Admin@123' }];
  }

  const usernames = process.env.ADMIN_USERNAMES?.split(',') || ['admin'];
  const passwords = process.env.ADMIN_PASSWORDS?.split(',') || ['Admin@123'];
  
  // Ensure we have matching username/password pairs
  const adminCount = Math.min(usernames.length, passwords.length);
  const admins = [];
  
  for (let i = 0; i < adminCount; i++) {
    admins.push({
      username: usernames[i]?.trim(),
      password: passwords[i]?.trim()
    });
  }
  
  console.log(`📋 Loaded ${admins.length} admin configurations from environment`);
  return admins;
}

const admins = loadAdminConfig();

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
