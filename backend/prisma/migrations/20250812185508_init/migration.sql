-- CreateTable
CREATE TABLE "public"."ManualDeposit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "utr" TEXT NOT NULL,
    "method" TEXT,
    "slipUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ManualDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WingoRound" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resultNumber" INTEGER,
    "resultAt" TIMESTAMP(3),
    "serialNumber" INTEGER,

    CONSTRAINT "WingoRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WingoRoundAnalytics" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "totalBets" DOUBLE PRECISION NOT NULL,
    "totalPayout" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WingoRoundAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WingoBet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "multiplier" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "win" BOOLEAN,
    "payout" DOUBLE PRECISION,

    CONSTRAINT "WingoBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ManualWithdraw" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountHolder" TEXT,
    "accountNumber" TEXT,
    "ifsc" TEXT,

    CONSTRAINT "ManualWithdraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordReset" (
    "id" SERIAL NOT NULL,
    "mobile" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileUpload" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Bucket" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "uploadedBy" INTEGER,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "ManualDeposit_userId_idx" ON "public"."ManualDeposit"("userId");

-- CreateIndex
CREATE INDEX "ManualDeposit_status_idx" ON "public"."ManualDeposit"("status");

-- CreateIndex
CREATE INDEX "ManualDeposit_createdAt_idx" ON "public"."ManualDeposit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "public"."User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "public"."User"("referralCode");

-- CreateIndex
CREATE INDEX "User_mobile_idx" ON "public"."User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "WingoRound_period_key" ON "public"."WingoRound"("period");

-- CreateIndex
CREATE INDEX "WingoRound_period_idx" ON "public"."WingoRound"("period");

-- CreateIndex
CREATE INDEX "WingoRound_interval_idx" ON "public"."WingoRound"("interval");

-- CreateIndex
CREATE INDEX "WingoRound_serialNumber_idx" ON "public"."WingoRound"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WingoRoundAnalytics_roundId_key" ON "public"."WingoRoundAnalytics"("roundId");

-- CreateIndex
CREATE INDEX "WingoBet_roundId_idx" ON "public"."WingoBet"("roundId");

-- CreateIndex
CREATE INDEX "WingoBet_userId_idx" ON "public"."WingoBet"("userId");

-- CreateIndex
CREATE INDEX "WingoBet_createdAt_idx" ON "public"."WingoBet"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "public"."Admin"("username");

-- CreateIndex
CREATE INDEX "PasswordReset_mobile_idx" ON "public"."PasswordReset"("mobile");

-- CreateIndex
CREATE INDEX "PasswordReset_otp_idx" ON "public"."PasswordReset"("otp");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "public"."PasswordReset"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "FileUpload_s3Key_key" ON "public"."FileUpload"("s3Key");

-- CreateIndex
CREATE INDEX "FileUpload_uploadedBy_idx" ON "public"."FileUpload"("uploadedBy");

-- CreateIndex
CREATE INDEX "FileUpload_category_idx" ON "public"."FileUpload"("category");

-- CreateIndex
CREATE INDEX "FileUpload_status_idx" ON "public"."FileUpload"("status");

-- CreateIndex
CREATE INDEX "FileUpload_createdAt_idx" ON "public"."FileUpload"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "public"."AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_success_idx" ON "public"."AuditLog"("success");

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

-- AddForeignKey
ALTER TABLE "public"."ManualDeposit" ADD CONSTRAINT "ManualDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WingoBet" ADD CONSTRAINT "WingoBet_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."WingoRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WingoBet" ADD CONSTRAINT "WingoBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileUpload" ADD CONSTRAINT "FileUpload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_fileUploadId_fkey" FOREIGN KEY ("fileUploadId") REFERENCES "public"."FileUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
