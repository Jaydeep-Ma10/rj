// scripts/addDemoUserColumn.js
import { prisma } from '../prisma/client.js';

/**
 * Add isDemoUser column to User table
 */
async function addDemoUserColumn() {
  try {
    console.log('Adding isDemoUser column to User table...');
    
    // Add the column with default value false
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "isDemoUser" BOOLEAN DEFAULT false;
    `;
    
    // Also make referralCode nullable temporarily for existing users
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ALTER COLUMN "referralCode" DROP NOT NULL;
    `;
    
    console.log('Successfully added isDemoUser column');
    
    // Create index for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "User_isDemoUser_idx" ON "User"("isDemoUser");
    `;
    
    console.log('Created index on isDemoUser column');
    
  } catch (error) {
    console.error('Error adding isDemoUser column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDemoUserColumn();
