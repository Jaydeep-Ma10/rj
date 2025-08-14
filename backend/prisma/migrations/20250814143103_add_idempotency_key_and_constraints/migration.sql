/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `WingoBet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roundId,type,value]` on the table `WingoBet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `WingoBet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."WingoBet_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."WingoBet" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "multiplier" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "WingoBet_idempotencyKey_key" ON "public"."WingoBet"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WingoBet_idempotencyKey_idx" ON "public"."WingoBet"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "WingoBet_userId_roundId_type_value_key" ON "public"."WingoBet"("userId", "roundId", "type", "value");
