-- CreateTable
CREATE TABLE "WingoRound" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resultNumber" INTEGER,
    "resultAt" TIMESTAMP(3),

    CONSTRAINT "WingoRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WingoBet" (
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

-- CreateIndex
CREATE UNIQUE INDEX "WingoRound_period_key" ON "WingoRound"("period");

-- AddForeignKey
ALTER TABLE "WingoBet" ADD CONSTRAINT "WingoBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WingoBet" ADD CONSTRAINT "WingoBet_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "WingoRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
