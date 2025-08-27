// Script to seed active WingoRound records for all intervals
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const intervals = [
    { label: '30s', durationMs: 30000 },
    { label: '1m', durationMs: 60000 },
    { label: '3m', durationMs: 180000 },
    { label: '5m', durationMs: 300000 }
  ];

  for (const { label, durationMs } of intervals) {
    // Remove existing pending rounds for this interval overlapping now
    await prisma.wingoRound.deleteMany({
      where: {
        interval: label,
        status: 'pending',
        startTime: { lte: now },
        endTime: { gte: now }
      }
    });
    // Find latest round for this interval
    const latest = await prisma.wingoRound.findFirst({
      where: { interval: label },
      orderBy: { endTime: 'desc' }
    });
    let nextPeriod = latest ? (parseInt(latest.period) + 1) : 1;
    const startTime = new Date(now.getTime() - 5000); // started 5s ago
    const endTime = new Date(startTime.getTime() + durationMs);
    await prisma.wingoRound.create({
      data: {
        period: String(nextPeriod),
        interval: label,
        startTime,
        endTime,
        status: 'pending'
      }
    });
    console.log(`Seeded round for interval ${label}`);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
