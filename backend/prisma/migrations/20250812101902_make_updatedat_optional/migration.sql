/*
  Warnings:

  - You are about to drop the column `details` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `s3Bucket` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `s3Url` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedBy` on the `FileUpload` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `ManualDeposit` table. All the data in the column will be lost.
  - You are about to drop the `UserActivity` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `FileUpload` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bucket` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadType` to the `FileUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ManualDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ManualWithdraw` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WingoRound` table without a default value. This is not possible if the table is not empty.
  - Added the required column `betCount` to the `WingoRoundAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerCount` to the `WingoRoundAnalytics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FileUpload" DROP CONSTRAINT "FileUpload_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserActivity" DROP CONSTRAINT "UserActivity_userId_fkey";

-- DropIndex
DROP INDEX "public"."AuditLog_resource_idx";

-- DropIndex
DROP INDEX "public"."AuditLog_success_idx";

-- DropIndex
DROP INDEX "public"."FileUpload_category_idx";

-- DropIndex
DROP INDEX "public"."FileUpload_s3Key_key";

-- DropIndex
DROP INDEX "public"."FileUpload_uploadedBy_idx";

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP COLUMN "details",
DROP COLUMN "errorMessage",
DROP COLUMN "resource",
DROP COLUMN "resourceId",
DROP COLUMN "success",
ADD COLUMN     "adminId" INTEGER,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."FileUpload" DROP COLUMN "category",
DROP COLUMN "filename",
DROP COLUMN "metadata",
DROP COLUMN "mimeType",
DROP COLUMN "originalName",
DROP COLUMN "s3Bucket",
DROP COLUMN "s3Key",
DROP COLUMN "s3Url",
DROP COLUMN "size",
DROP COLUMN "uploadedBy",
ADD COLUMN     "bucket" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "uploadType" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "public"."ManualDeposit" DROP COLUMN "approvedAt",
DROP COLUMN "metadata",
DROP COLUMN "rejectionReason",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rejectedBy" INTEGER,
ADD COLUMN     "slipUploadId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" INTEGER;

-- AlterTable
ALTER TABLE "public"."ManualWithdraw" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedBy" INTEGER,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" INTEGER,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PasswordReset" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastActive" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."WingoBet" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "public"."WingoRound" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "houseProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalBets" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."WingoRoundAnalytics" ADD COLUMN     "betCount" INTEGER NOT NULL,
ADD COLUMN     "playerCount" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."UserActivity";

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemConfig" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateLimit" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "public"."UserSession"("token");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "public"."UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_token_idx" ON "public"."UserSession"("token");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "public"."UserSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "public"."SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "public"."SystemConfig"("key");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_action_idx" ON "public"."RateLimit"("identifier", "action");

-- CreateIndex
CREATE INDEX "RateLimit_expiresAt_idx" ON "public"."RateLimit"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_action_windowStart_key" ON "public"."RateLimit"("identifier", "action", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_username_idx" ON "public"."Admin"("username");

-- CreateIndex
CREATE INDEX "Admin_isActive_idx" ON "public"."Admin"("isActive");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "public"."AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_status_idx" ON "public"."AuditLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FileUpload_key_key" ON "public"."FileUpload"("key");

-- CreateIndex
CREATE INDEX "FileUpload_userId_idx" ON "public"."FileUpload"("userId");

-- CreateIndex
CREATE INDEX "FileUpload_uploadType_idx" ON "public"."FileUpload"("uploadType");

-- CreateIndex
CREATE INDEX "KycDocument_fileUploadId_idx" ON "public"."KycDocument"("fileUploadId");

-- CreateIndex
CREATE INDEX "ManualDeposit_mobile_idx" ON "public"."ManualDeposit"("mobile");

-- CreateIndex
CREATE INDEX "ManualWithdraw_userId_idx" ON "public"."ManualWithdraw"("userId");

-- CreateIndex
CREATE INDEX "ManualWithdraw_status_idx" ON "public"."ManualWithdraw"("status");

-- CreateIndex
CREATE INDEX "ManualWithdraw_createdAt_idx" ON "public"."ManualWithdraw"("createdAt");

-- CreateIndex
CREATE INDEX "ManualWithdraw_mobile_idx" ON "public"."ManualWithdraw"("mobile");

-- CreateIndex
CREATE INDEX "PasswordReset_isUsed_idx" ON "public"."PasswordReset"("isUsed");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- CreateIndex
CREATE INDEX "User_lastActive_idx" ON "public"."User"("lastActive");

-- CreateIndex
CREATE INDEX "WingoBet_win_idx" ON "public"."WingoBet"("win");

-- CreateIndex
CREATE INDEX "WingoRound_status_idx" ON "public"."WingoRound"("status");

-- CreateIndex
CREATE INDEX "WingoRound_startTime_idx" ON "public"."WingoRound"("startTime");

-- CreateIndex
CREATE INDEX "WingoRoundAnalytics_roundId_idx" ON "public"."WingoRoundAnalytics"("roundId");

-- CreateIndex
CREATE INDEX "WingoRoundAnalytics_createdAt_idx" ON "public"."WingoRoundAnalytics"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."FileUpload" ADD CONSTRAINT "FileUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManualDeposit" ADD CONSTRAINT "ManualDeposit_slipUploadId_fkey" FOREIGN KEY ("slipUploadId") REFERENCES "public"."FileUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WingoRoundAnalytics" ADD CONSTRAINT "WingoRoundAnalytics_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."WingoRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManualWithdraw" ADD CONSTRAINT "ManualWithdraw_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
