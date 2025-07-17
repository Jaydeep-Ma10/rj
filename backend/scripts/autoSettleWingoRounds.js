// Script to auto-settle expired Wingo rounds for all intervals
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  while (true) {
    const now = new Date();
    // Find all expired, un-settled rounds
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
        // Run settlement logic (reuse backend logic here)
        // Inline settlement copied from wingoController.settleRound
        const bets = await prisma.wingoBet.findMany({ where: { roundId: round.id } });
        let resultNumber;
        if (bets.length === 1) {
          // Single user bet logic
          const bet = bets[0];
          if (bet.amount < 500) {
            // Favor user to win
            resultNumber = pickWinningNumberForBet(bet);
          } else {
            // Favor user to lose
            resultNumber = pickLosingNumberForBet(bet);
          }
        } else {
          // Random result
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
            // Use correct odds for payout
            if (bet.type === 'color') {
              payout = bet.amount * (bet.value === 'violet' ? 4.5 : 2);
            } else if (bet.type === 'bigsmall') {
              payout = bet.amount * 2;
            } else if (bet.type === 'number') {
              payout = bet.amount * 9;
            }
            await prisma.user.update({ where: { id: bet.userId }, data: { balance: { increment: payout } } });
          }
          await prisma.wingoBet.update({ where: { id: bet.id }, data: { win, payout } });
        }
        // Update round
        await prisma.wingoRound.update({ where: { id: round.id }, data: { status: 'settled', resultNumber, resultAt: new Date() } });
        console.log(`[${new Date().toLocaleTimeString()}] Settled round id=${round.id} with resultNumber=${resultNumber}`);
      } catch (err) {
        console.error('Error settling round:', err);
      }
    }
    await new Promise(res => setTimeout(res, 5000));
  }
}

// Helper: pick a winning number for user bet
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
// Helper: pick a losing number for user bet
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

main().catch(e => { console.error(e); process.exit(1); });
