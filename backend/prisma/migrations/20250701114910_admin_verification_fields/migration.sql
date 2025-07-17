-- AlterTable
ALTER TABLE "ManualDeposit" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "userId" INTEGER;
