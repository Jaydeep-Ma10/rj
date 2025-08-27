// scripts/fix-status-column.js
import { execSync } from 'child_process';
import 'dotenv/config';

async function fixStatusColumn() {
  try {
    console.log('🔄 Attempting to add status column to WingoBet table...');
    
    const sql = `
      ALTER TABLE "WingoBet" 
      ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
      
      UPDATE "WingoBet" 
      SET "status" = CASE 
        WHEN "win" IS NOT NULL THEN 'settled' 
        ELSE 'pending' 
      END;
    `;

    execSync(`npx prisma db execute --stdin --url="${process.env.DATABASE_URL}"`, {
      input: sql,
      stdio: 'inherit'
    });
    
    console.log('✅ Status column fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing status column:', error.message);
    process.exit(1);
  }
}

fixStatusColumn();
