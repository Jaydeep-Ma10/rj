-- CreateTable
CREATE TABLE "WingoRoundAnalytics" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "totalBets" DOUBLE PRECISION NOT NULL,
    "totalPayout" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WingoRoundAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WingoRoundAnalytics_roundId_key" ON "WingoRoundAnalytics"("roundId");
