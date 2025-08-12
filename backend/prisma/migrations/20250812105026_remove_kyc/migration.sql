/*
  Warnings:

  - You are about to drop the column `kycStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kycVerifiedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `KycDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."KycDocument" DROP CONSTRAINT "KycDocument_fileUploadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."KycDocument" DROP CONSTRAINT "KycDocument_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "kycStatus",
DROP COLUMN "kycVerifiedAt";

-- DropTable
DROP TABLE "public"."KycDocument";
