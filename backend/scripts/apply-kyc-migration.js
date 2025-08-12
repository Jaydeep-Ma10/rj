import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

async function applyKycMigration() {
  console.log('🚀 Starting KYC migration...');
  
  try {
    // 1. Check if the migration has already been applied
    console.log('🔍 Checking if migration has already been applied...');
    
    // Try to describe the KYC-related tables to see if they exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name = 'KycDocument' OR table_name = 'FileUpload');
    `;
    
    const hasKycDocumentTable = tables.some(t => t.table_name === 'KycDocument');
    const hasFileUploadTable = tables.some(t => t.table_name === 'FileUpload');
    
    if (hasKycDocumentTable && hasFileUploadTable) {
      console.log('✅ KYC tables already exist. Checking schema...');
      
      // Check if the kycStatus column exists in the User table
      const columns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
          AND column_name IN ('kycStatus', 'kycVerifiedAt');
      `;
      
      const hasKycFields = columns.length === 2;
      
      if (hasKycFields) {
        console.log('✅ KYC fields already exist in User table. Migration already applied.');
        return;
      }
    }
    
    // 2. Apply the migration
    console.log('🔄 Applying KYC migration...');
    
    // Run the migration using Prisma
    console.log('🏗️  Running Prisma migration...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // 3. Verify the migration
    console.log('✅ Migration applied. Verifying...');
    
    // Check if the tables and columns were created
    const updatedTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name = 'KycDocument' OR table_name = 'FileUpload');
    `;
    
    if (!updatedTables.some(t => t.table_name === 'KycDocument')) {
      throw new Error('Failed to create KycDocument table');
    }
    
    if (!updatedTables.some(t => t.table_name === 'FileUpload')) {
      throw new Error('Failed to create FileUpload table');
    }
    
    const updatedColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
        AND column_name IN ('kycStatus', 'kycVerifiedAt');
    `;
    
    if (updatedColumns.length !== 2) {
      throw new Error('Failed to add KYC fields to User table');
    }
    
    console.log('✅ KYC migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Please check the error above and try again.');
    console.error('If the migration partially succeeded, you may need to manually clean up and retry.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
applyKycMigration();
