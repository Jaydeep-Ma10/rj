-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "kycStatus" TEXT NOT NULL DEFAULT 'not_verified',
ADD COLUMN     "kycVerifiedAt" TIMESTAMP(3);
