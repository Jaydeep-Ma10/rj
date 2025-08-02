-- Add password reset functionality with OTP support
CREATE TABLE "PasswordReset" (
  "id" SERIAL PRIMARY KEY,
  "mobile" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "isUsed" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER,
  CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add index for efficient lookups
CREATE INDEX "PasswordReset_mobile_idx" ON "PasswordReset"("mobile");
CREATE INDEX "PasswordReset_otp_idx" ON "PasswordReset"("otp");
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
