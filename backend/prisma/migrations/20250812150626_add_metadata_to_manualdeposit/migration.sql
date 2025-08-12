/*
  Warnings:

  - You are about to drop the column `email` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `lockedUntil` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `loginAttempts` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `bucket` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `uploadType` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedBy` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `slipUploadId` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `processedBy` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedBy` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `attempts` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lockedUntil` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `loginAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `marketingConsent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mobileVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privacyAcceptedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `termsAcceptedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `WingoBet` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `WingoBet` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WingoRound` table. All the data in the column will be lost.
  - You are about to drop the column `houseProfit` on the `WingoRound` table. All the data in the column will be lost.
  - You are about to drop the column `totalBets` on the `WingoRound` table. All the data in the column will be lost.
  - You are about to drop the column `totalPayout` on the `WingoRound` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WingoRound` table. All the data in the column will be lost.
  - You are about to drop the column `betCount` on the `WingoRoundAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `playerCount` on the `WingoRoundAnalytics` table. All the data in the column will be lost.
  - You are about to drop the `RateLimit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[s3Key]` on the table `FileUpload` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resource` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Bucket` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Url` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `FileUpload` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FileUpload" DROP CONSTRAINT "FileUpload_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ManualDeposit" DROP CONSTRAINT "ManualDeposit_slipUploadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ManualWithdraw" DROP CONSTRAINT "ManualWithdraw_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSession" DROP CONSTRAINT "UserSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WingoRoundAnalytics" DROP CONSTRAINT "WingoRoundAnalytics_roundId_fkey";

-- DropIndex
DROP INDEX "public"."Admin_email_key";

-- DropIndex
DROP INDEX "public"."Admin_isActive_idx";

-- DropIndex
DROP INDEX "public"."Admin_username_idx";

-- DropIndex
DROP INDEX "public"."AuditLog_adminId_idx";

-- DropIndex
DROP INDEX "public"."AuditLog_status_idx";

-- DropIndex
DROP INDEX "public"."FileUpload_key_key";

-- DropIndex
DROP INDEX "public"."FileUpload_uploadType_idx";

-- DropIndex
DROP INDEX "public"."FileUpload_userId_idx";

-- DropIndex
DROP INDEX "public"."ManualDeposit_mobile_idx";

-- DropIndex
DROP INDEX "public"."ManualWithdraw_createdAt_idx";

-- DropIndex
DROP INDEX "public"."ManualWithdraw_mobile_idx";

-- DropIndex
DROP INDEX "public"."ManualWithdraw_status_idx";

-- DropIndex
DROP INDEX "public"."ManualWithdraw_userId_idx";

-- DropIndex
DROP INDEX "public"."PasswordReset_isUsed_idx";

-- DropIndex
DROP INDEX "public"."User_isActive_idx";

-- DropIndex
DROP INDEX "public"."User_lastActive_idx";

-- DropIndex
DROP INDEX "public"."WingoBet_win_idx";

-- DropIndex
DROP INDEX "public"."WingoRound_startTime_idx";

-- DropIndex
DROP INDEX "public"."WingoRound_status_idx";

-- DropIndex
DROP INDEX "public"."WingoRoundAnalytics_createdAt_idx";

-- DropIndex
DROP INDEX "public"."WingoRoundAnalytics_roundId_idx";

-- AlterTable
ALTER TABLE "public"."Admin" DROP COLUMN "email",
DROP COLUMN "isActive",
DROP COLUMN "lockedUntil",
DROP COLUMN "loginAttempts",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP COLUMN "adminId",
DROP COLUMN "error",
DROP COLUMN "metadata",
DROP COLUMN "status",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "resource" TEXT NOT NULL,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "success" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."FileUpload" DROP COLUMN "bucket",
DROP COLUMN "fileName",
DROP COLUMN "fileSize",
DROP COLUMN "fileType",
DROP COLUMN "key",
DROP COLUMN "uploadType",
DROP COLUMN "userId",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "s3Bucket" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "s3Url" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "uploadedBy" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."ManualDeposit" DROP COLUMN "notes",
DROP COLUMN "rejectedBy",
DROP COLUMN "slipUploadId",
DROP COLUMN "updatedAt",
DROP COLUMN "verifiedAt",
DROP COLUMN "verifiedBy",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "public"."ManualWithdraw" DROP COLUMN "bankName",
DROP COLUMN "notes",
DROP COLUMN "processedAt",
DROP COLUMN "processedBy",
DROP COLUMN "rejectedAt",
DROP COLUMN "rejectedBy",
DROP COLUMN "transactionId",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."PasswordReset" DROP COLUMN "attempts",
DROP COLUMN "ipAddress",
DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "emailVerified",
DROP COLUMN "isActive",
DROP COLUMN "lastActive",
DROP COLUMN "lockedUntil",
DROP COLUMN "loginAttempts",
DROP COLUMN "marketingConsent",
DROP COLUMN "mobileVerified",
DROP COLUMN "privacyAcceptedAt",
DROP COLUMN "termsAcceptedAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."WingoBet" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "public"."WingoRound" DROP COLUMN "createdAt",
DROP COLUMN "houseProfit",
DROP COLUMN "totalBets",
DROP COLUMN "totalPayout",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."WingoRoundAnalytics" DROP COLUMN "betCount",
DROP COLUMN "playerCount";

-- DropTable
DROP TABLE "public"."RateLimit";

-- DropTable
DROP TABLE "public"."SystemConfig";

-- DropTable
DROP TABLE "public"."UserSession";

-- CreateTable
CREATE TABLE "public"."KycDocument" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUploadId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KycDocument_userId_idx" ON "public"."KycDocument"("userId");

-- CreateIndex
CREATE INDEX "KycDocument_documentType_idx" ON "public"."KycDocument"("documentType");

-- CreateIndex
CREATE INDEX "KycDocument_status_idx" ON "public"."KycDocument"("status");

-- CreateIndex
CREATE INDEX "KycDocument_createdAt_idx" ON "public"."KycDocument"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "public"."UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_activityType_idx" ON "public"."UserActivity"("activityType");

-- CreateIndex
CREATE INDEX "UserActivity_createdAt_idx" ON "public"."UserActivity"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_sessionId_idx" ON "public"."UserActivity"("sessionId");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "public"."AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_success_idx" ON "public"."AuditLog"("success");

-- CreateIndex
CREATE UNIQUE INDEX "FileUpload_s3Key_key" ON "public"."FileUpload"("s3Key");

-- CreateIndex
CREATE INDEX "FileUpload_uploadedBy_idx" ON "public"."FileUpload"("uploadedBy");

-- CreateIndex
CREATE INDEX "FileUpload_category_idx" ON "public"."FileUpload"("category");

-- AddForeignKey
ALTER TABLE "public"."FileUpload" ADD CONSTRAINT "FileUpload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_fileUploadId_fkey" FOREIGN KEY ("fileUploadId") REFERENCES "public"."FileUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
