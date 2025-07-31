/*
  Warnings:

  - Made the column `mobile` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "mobile" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_mobile_idx" ON "User"("mobile");

-- CreateIndex
CREATE INDEX "WingoBet_roundId_idx" ON "WingoBet"("roundId");

-- CreateIndex
CREATE INDEX "WingoBet_userId_idx" ON "WingoBet"("userId");

-- CreateIndex
CREATE INDEX "WingoBet_createdAt_idx" ON "WingoBet"("createdAt");

-- CreateIndex
CREATE INDEX "WingoRound_period_idx" ON "WingoRound"("period");

-- CreateIndex
CREATE INDEX "WingoRound_interval_idx" ON "WingoRound"("interval");

-- CreateIndex
CREATE INDEX "WingoRound_serialNumber_idx" ON "WingoRound"("serialNumber");
