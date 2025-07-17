/*
  Warnings:

  - You are about to drop the column `method` on the `ManualWithdraw` table. All the data in the column will be lost.
  - You are about to drop the column `utr` on the `ManualWithdraw` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ManualWithdraw" DROP COLUMN "method",
DROP COLUMN "utr",
ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "ifsc" TEXT;
