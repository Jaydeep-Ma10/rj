import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INTERVALS = [
  { label: '30s', durationMs: 30000 },
  { label: '1m', durationMs: 60000 },
  { label: '3m', durationMs: 180000 },
  { label: '5m', durationMs: 300000 }
];

// Helper functions from autoSettleWingoRounds.js
function pickWinningNumberForBet(bet) {
  if (bet.type === 'color') {
    if (bet.value === 'green') return [1,3,7,9][Math.floor(Math.random()*4)];
    if (bet.value === 'red') return [2,4,6,8,9][Math.floor(Math.random()*5)];
    if (bet.value === 'violet') return [0,5][Math.floor(Math.random()*2)];
  } else if (bet.type === 'bigsmall') {
    if (bet.value === 'big') return [5,6,7,8,9][Math.floor(Math.random()*5)];
    if (bet.value === 'small') return [0,1,2,3,4][Math.floor(Math.random()*5)];
  } else if (bet.type === 'number') {
    return parseInt(bet.value);
  }
}

function pickLosingNumberForBet(bet) {
  if (bet.type === 'color') {
    const colors = ['green','red','violet'].filter(c=>c!==bet.value);
    const color = colors[Math.floor(Math.random()*colors.length)];
    if (color === 'green') return [1,3,7,9][Math.floor(Math.random()*4)];
    if (color === 'red') return [2,4,6,8,9][Math.floor(Math.random()*5)];
    if (color === 'violet') return [0,5][Math.floor(Math.random()*2)];
  } else if (bet.type === 'bigsmall') {
    const other = bet.value === 'big' ? 'small' : 'big';
    if (other === 'big') return [5,6,7,8,9][Math.floor(Math.random()*5)];
    if (other === 'small') return [0,1,2,3,4][Math.floor(Math.random()*5)];
  } else if (bet.type === 'number') {
    const nums = Array.from({length:10},(_,i)=>i).filter(n=>n!==parseInt(bet.value));
    return nums[Math.floor(Math.random()*nums.length)];
  }
}

export async function createRoundsForAllIntervals() {
  try {
    console.log('🔍 Checking rounds for all intervals:', INTERVALS.map(i => i.label));
    
    // Get all pending rounds to check what we already have
    const pendingRounds = await prisma.wingoRound.findMany({
      where: {
        status: 'pending'
      },
      select: {
        interval: true,
        startTime: true,
        endTime: true,
        period: true
      }
    });
    
    console.log(`📊 Found ${pendingRounds.length} pending rounds:`, 
      pendingRounds.map(r => `${r.interval}(${r.period})`));

    // Process each interval type
    for (const { label, durationMs } of INTERVALS) {
      const now = new Date();
      
      // Check if we already have a pending round for this interval
      const hasActiveRound = pendingRounds.some(round => 
        round.interval === label && 
        round.startTime <= now && 
        round.endTime >= now
      );
      
      console.log(`🎯 Interval ${label}: hasActiveRound=${hasActiveRound}`);
      
      if (!hasActiveRound) {
        // Check if we need to create a new round
        const latestRound = await prisma.wingoRound.findFirst({
          where: { interval: label },
          orderBy: { endTime: 'desc' },
          select: { endTime: true, period: true }
        });
        
        const needsNewRound = !latestRound || latestRound.endTime < now;
        console.log(`⏰ Interval ${label}: needsNewRound=${needsNewRound} (latest: ${latestRound?.period || 'none'})`);
        
        // Only create a new round if the last one has ended or doesn't exist
        if (needsNewRound) {
          console.log(`🚀 Creating new round for interval ${label}`);
          await createNextRound(label, durationMs);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in createRoundsForAllIntervals:', error);
    throw error; // Re-throw to be caught by the calling function
  }
}

async function createNextRound(label, durationMs) {
  // Use a transaction to prevent race conditions
  return await prisma.$transaction(async (tx) => {
    const now = new Date();
    
    // Double-check there isn't already a pending round for this interval
    const existingRound = await tx.wingoRound.findFirst({
      where: {
        interval: label,
        status: 'pending',
        startTime: { lte: now },
        endTime: { gte: now }
      }
    });
    
    if (existingRound) {
      console.log(`[${now.toLocaleTimeString()}] Round already exists for ${label} interval`);
      return existingRound;
    }
    
    // Find the latest round to determine the next start time
    const latest = await tx.wingoRound.findFirst({
      where: { interval: label },
      orderBy: { endTime: 'desc' }
    });
    
    let startTime, endTime;
    if (!latest || latest.endTime < now) {
      startTime = new Date(now);
      endTime = new Date(startTime.getTime() + durationMs);
    } else {
      startTime = new Date(latest.endTime);
      endTime = new Date(startTime.getTime() + durationMs);
    }
    
    // Generate a unique period ID
    const pad = (n, l = 2) => n.toString().padStart(l, '0');
    const ts = startTime;
    const nextPeriod = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}${pad(ts.getMilliseconds(), 3)}`;
    
    // Find the latest serialNumber for this specific interval
    const latestSerial = await tx.wingoRound.findFirst({
      where: { 
        interval: label,
        serialNumber: { not: null } // Only consider rounds with serial numbers
      },
      orderBy: { serialNumber: 'desc' },
      select: { serialNumber: true }
    });
    
    // Fallback: if no serial found, count total rounds for this interval
    let nextSerial;
    if (latestSerial?.serialNumber) {
      nextSerial = latestSerial.serialNumber + 1;
    } else {
      // Count all rounds for this interval to determine next serial
      const roundCount = await tx.wingoRound.count({
        where: { interval: label }
      });
      nextSerial = roundCount + 1;
    }
    
    console.log(`🔢 Serial for ${label}: latest=${latestSerial?.serialNumber || 'none'}, next=${nextSerial}`);

    // Create the new round with serialNumber
    const newRound = await tx.wingoRound.create({
      data: {
        period: String(nextPeriod),
        interval: label,
        serialNumber: nextSerial,
        startTime,
        endTime,
        status: 'pending'
      }
    });
    
    console.log(`[${now.toLocaleTimeString()}] Created round for ${label} period ${nextPeriod} (serial ${nextSerial})`);
    return newRound;
  });
}

export async function settleExpiredRounds() {
  try {
    const now = new Date();
    const expiredRounds = await prisma.wingoRound.findMany({
      where: {
        endTime: { lt: now },
        status: 'pending',
      },
      orderBy: { endTime: 'asc' },
      take: 10
    });

    for (const round of expiredRounds) {
      try {
        console.log(`[${new Date().toLocaleTimeString()}] Settling round id=${round.id} period=${round.period} interval=${round.interval}`);
        
        const bets = await prisma.wingoBet.findMany({ where: { roundId: round.id } });
        let resultNumber;
        
        if (bets.length === 1) {
          const bet = bets[0];
          if (bet.amount < 500) {
            resultNumber = pickWinningNumberForBet(bet);
          } else {
            resultNumber = pickLosingNumberForBet(bet);
          }
        } else {
          resultNumber = Math.floor(Math.random() * 10);
        }

        // Settle all bets
        for (const bet of bets) {
          let win = false, payout = 0;
          if (bet.type === 'color') {
            if (
              (bet.value === 'green' && [1,3,7,9].includes(resultNumber)) ||
              (bet.value === 'red' && [2,4,6,8,9].includes(resultNumber)) ||
              (bet.value === 'violet' && [0,5].includes(resultNumber))
            ) win = true;
          } else if (bet.type === 'bigsmall') {
            if (
              (bet.value === 'big' && [5,6,7,8,9].includes(resultNumber)) ||
              (bet.value === 'small' && [0,1,2,3,4].includes(resultNumber))
            ) win = true;
          } else if (bet.type === 'number') {
            if (Number(bet.value) === resultNumber) win = true;
          }
          
          if (win) {
            if (bet.type === 'color') {
              payout = bet.amount * (bet.value === 'violet' ? 4.5 : 2);
            } else if (bet.type === 'bigsmall') {
              payout = bet.amount * 2;
            } else if (bet.type === 'number') {
              payout = bet.amount * 9;
            }
            await prisma.user.update({ 
              where: { id: bet.userId }, 
              data: { balance: { increment: payout } } 
            });
          }
          
          await prisma.wingoBet.update({ 
            where: { id: bet.id }, 
            data: { win, payout } 
          });
        }

        await prisma.wingoRound.update({ 
          where: { id: round.id }, 
          data: { 
            status: 'settled', 
            resultNumber, 
            resultAt: new Date() 
          } 
        });
        
        console.log(`[${new Date().toLocaleTimeString()}] Settled round id=${round.id} with resultNumber=${resultNumber}`);
      } catch (err) {
        console.error('Error settling round:', err);
      }
    }
  } catch (error) {
    console.error('Error in settleExpiredRounds:', error);
  }
}

// Track active operations to prevent race conditions
let isProcessing = {
  createRounds: false,
  settleRounds: false
};

// Initialize the round management system
export function initRoundManagement() {
  console.log('🎮 Initializing round management system...');
  
  // Settle any expired rounds from previous session (important for Render restarts)
  setTimeout(async () => {
    console.log('🔄 Checking for expired rounds from previous session...');
    await settleExpiredRounds();
    
    // Force create rounds for all intervals on startup
    console.log('🎯 Force creating rounds for all intervals on startup...');
    for (const { label, durationMs } of INTERVALS) {
      try {
        console.log(`🚀 Force creating round for ${label}`);
        await createNextRound(label, durationMs);
      } catch (error) {
        console.error(`❌ Failed to create ${label} round:`, error.message);
      }
    }
    
    console.log('✅ Startup round creation completed');
  }, 2000);
  
  // Check for new rounds every 10 seconds (aligned with round intervals)
  const createRoundsInterval = setInterval(() => {
    if (!isProcessing.createRounds) {
      isProcessing.createRounds = true;
      createRoundsForAllIntervals().catch(error => {
        console.error('❌ Error creating rounds:', error);
      }).finally(() => {
        isProcessing.createRounds = false;
      });
    }
  }, 10000);
  
  // Check for expired rounds every 5 seconds
  const settleRoundsInterval = setInterval(() => {
    if (!isProcessing.settleRounds) {
      isProcessing.settleRounds = true;
      settleExpiredRounds().catch(error => {
        console.error('❌ Error settling rounds:', error);
      }).finally(() => {
        isProcessing.settleRounds = false;
      });
    }
  }, 5000);
  
  // Cleanup function
  return () => {
    clearInterval(createRoundsInterval);
    clearInterval(settleRoundsInterval);
  };
}
