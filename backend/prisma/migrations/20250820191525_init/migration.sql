-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isDemoUser" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "referralCode" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_isDemoUser_idx" ON "public"."User"("isDemoUser");
