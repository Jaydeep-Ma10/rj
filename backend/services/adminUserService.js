// Admin User Service - Initialize admin users from environment configuration
import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';

/**
 * Load admin configuration from environment variables
 */
function loadAdminConfig() {
  const adminUsersEnabled = process.env.ADMIN_USERS_ENABLED === 'true';
  
  if (!adminUsersEnabled) {
    console.log('⚠️  Admin users disabled in environment config');
    return [];
  }

  const usernames = process.env.ADMIN_USERNAMES?.split(',') || [];
  const passwords = process.env.ADMIN_PASSWORDS?.split(',') || [];
  
  if (usernames.length === 0) {
    console.log('⚠️  No admin usernames found in environment config');
    return [];
  }

  // Ensure we have matching username/password pairs
  const adminCount = Math.min(usernames.length, passwords.length);
  const admins = [];
  
  for (let i = 0; i < adminCount; i++) {
    const username = usernames[i]?.trim();
    const password = passwords[i]?.trim();
    
    if (username && password) {
      admins.push({ username, password });
    }
  }
  
  console.log(`📋 Loaded ${admins.length} admin configurations from environment`);
  return admins;
}

/**
 * Initialize admin users from environment configuration
 */
export async function initializeAdminUsers() {
  try {
    const adminConfig = loadAdminConfig();
    
    if (adminConfig.length === 0) {
      console.log('ℹ️  No admin users to initialize');
      return { created: 0, existing: 0, total: 0 };
    }

    let created = 0;
    let existing = 0;

    console.log(`🚀 Initializing ${adminConfig.length} admin users...`);

    for (const admin of adminConfig) {
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
          }
        });

        console.log(`✅ Created admin: ${admin.username}`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating admin ${admin.username}:`, error.message);
      }
    }

    const total = created + existing;
    console.log(`📊 Admin initialization complete: ${created} created, ${existing} existing, ${total} total`);

    return { created, existing, total };

  } catch (error) {
    console.error('❌ Error initializing admin users:', error.message);
    throw error;
  }
}

/**
 * Get all admin users (for debugging/verification)
 */
export async function getAllAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return admins;
  } catch (error) {
    console.error('❌ Error fetching admin users:', error.message);
    throw error;
  }
}

/**
 * Verify admin credentials (for testing)
 */
export async function verifyAdminCredentials(username, password) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return { valid: false, message: 'Admin not found' };
    }

    const isValid = await bcrypt.compare(password, admin.password);
    
    return { 
      valid: isValid, 
      message: isValid ? 'Credentials valid' : 'Invalid password',
      admin: isValid ? { id: admin.id, username: admin.username } : null
    };
  } catch (error) {
    console.error('❌ Error verifying admin credentials:', error.message);
    return { valid: false, message: 'Verification error' };
  }
}
