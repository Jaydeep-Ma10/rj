// Continuously auto-create new Wingo rounds for all intervals
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const intervals = [
  { label: '30s', durationMs: 30000 },
  { label: '1m', durationMs: 60000 },
  { label: '3m', durationMs: 180000 },
  { label: '5m', durationMs: 300000 }
];

async function createNextRound(label, durationMs) {
  const now = new Date();
  // Find latest round for this interval
  const latest = await prisma.wingoRound.findFirst({
    where: { interval: label },
    orderBy: { endTime: 'desc' }
  });
  let startTime, endTime, nextPeriod;
  if (!latest || latest.endTime < now) {
    startTime = new Date(now.getTime());
    endTime = new Date(startTime.getTime() + durationMs);
  } else {
    startTime = new Date(latest.endTime);
    endTime = new Date(startTime.getTime() + durationMs);
  }
  // Use timestamp-based period for uniqueness
  const pad = (n, l=2) => n.toString().padStart(l, '0');
  const ts = startTime;
  nextPeriod = `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}${pad(ts.getMilliseconds(),3)}`;
  await prisma.wingoRound.create({
    data: {
      period: String(nextPeriod),
      interval: label,
      startTime,
      endTime,
      status: 'pending'
    }
  });
  console.log(`[${new Date().toLocaleTimeString()}] Created round for ${label} period ${nextPeriod} (${startTime.toISOString()} - ${endTime.toISOString()})`);
}


async function loop() {
  while (true) {
    try {
      for (const { label, durationMs } of intervals) {
        // Check if there's a pending round covering now
        const now = new Date();
        const exists = await prisma.wingoRound.findFirst({
          where: {
            interval: label,
            status: 'pending',
            startTime: { lte: now },
            endTime: { gte: now }
          }
        });
        if (!exists) {
          await createNextRound(label, durationMs);
        }
      }
    } catch (e) {
      console.error('Auto-create round error:', e);
    }
    await new Promise(res => setTimeout(res, 5000)); // check every 5s
  }
}

loop();
