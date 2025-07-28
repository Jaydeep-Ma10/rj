import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper: pick a winning number for user bet
function pickWinningNumberForBet(bet) {
  if (bet.type === 'color') {
    if (bet.value === 'green') return [1,3,7,9][Math.floor(Math.random()*4)];
    if (bet.value === 'red') return [2,4,6,8][Math.floor(Math.random()*4)];
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
    if (color === 'red') return [2,4,6,8][Math.floor(Math.random()*4)];
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

// POST /wingo/bet
export const placeBet = async (req, res) => {
  try {
    console.log('Received bet request:', req.body);
    const { userId, roundId, type, value, amount, multiplier } = req.body;
    console.log('[Wingo] Received bet request:', req.body);
    if (!userId || !roundId || !type || !value || !amount || !multiplier) {
      console.error('[Wingo] Bet rejected: Missing required fields', req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`[Wingo] Bet attempt by userId=${userId}. User lookup:`, user);
    if (!user) {
      console.error(`[Wingo] Bet rejected: User not found for userId ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`[Wingo] User ${userId} balance BEFORE bet:`, user.balance);
    if (user.balance < amount) {
      console.error(`[Wingo] Bet rejected: Insufficient balance for userId ${userId}. Balance: ${user.balance}, Attempted bet: ${amount}`);
      return res.status(400).json({ error: "Insufficient balance" });
    }
    // Deduct balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } }
    });
    console.log(`[Wingo] User ${userId} balance AFTER bet:`, updatedUser.balance);
    // Create bet
    try {
      const bet = await prisma.wingoBet.create({
        data: { userId, roundId, type, value: String(value), amount, multiplier }
      });
      console.log('Bet created successfully:', bet);
      res.status(201).json({ message: "Bet placed", bet });
    } catch (betError) {
      // Refund on failure
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } }
      });
      console.error('Error creating bet:', betError);
      res.status(500).json({ error: 'Failed to create bet', details: betError.message });
    }
  } catch (e) {
    console.error("Wingo bet error:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// GET /wingo/round/current
export const getCurrentRound = async (req, res) => {
  try {
    const { interval } = req.query;
    const now = new Date();
    const where = {
      startTime: { lte: now },
      endTime: { gte: now },
      status: "pending"
    };
    if (interval) where.interval = interval;
    const round = await prisma.wingoRound.findFirst({
      where,
      orderBy: { startTime: "desc" }
    });
    if (!round) return res.status(404).json({ error: "No current round" });
    res.json(round);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// POST /wingo/round/settle
export const settleRound = async (req, res) => {
  try {
    console.log('[Wingo] settleRound called with body:', req.body);

    const { roundId } = req.body;
    const round = await prisma.wingoRound.findUnique({ where: { id: roundId }, include: { bets: true } });
    if (!round) return res.status(404).json({ error: "Round not found" });
    if (round.status !== "pending") return res.status(400).json({ error: "Round already settled" });
    const bets = round.bets;
    let resultNumber;
    if (bets.length === 1) {
      // Single user bet logic
      const bet = bets[0];
      // Calculate totalAmount (amount * multiplier)
      const totalAmount = bet.amount * bet.multiplier;
      // Check last 3 settled single-user bets for this user
      const last3Bets = await prisma.wingoBet.findMany({
        where: {
          userId: bet.userId,
          win: true,
          round: {
            status: 'settled',
            bets: { some: {} }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      const allLast3Wins = last3Bets.length === 3 && last3Bets.every(b => b.win === true);
      if (allLast3Wins || totalAmount >= 500) {
        resultNumber = pickLosingNumberForBet(bet);
      } else {
        resultNumber = pickWinningNumberForBet(bet);
      }
    } else {
      // Multi-user: pick the digit with the lowest total bet amount (across all bet types)
      let betSums = Array(10).fill(0); // betSums[digit] = total bet amount on digit
      for (const bet of bets) {
        const amount = bet.amount * bet.multiplier;
        if (bet.type === 'color') {
          if (bet.value === 'green') [1,3,7,9].forEach(d => betSums[d] += amount);
          if (bet.value === 'red') [2,4,6,8].forEach(d => betSums[d] += amount);
          if (bet.value === 'violet') [0,5].forEach(d => betSums[d] += amount);
        }
        if (bet.type === 'bigsmall') {
          if (bet.value === 'big') [5,6,7,8,9].forEach(d => betSums[d] += amount);
          if (bet.value === 'small') [0,1,2,3,4].forEach(d => betSums[d] += amount);
        }
        if (bet.type === 'number') {
          const digit = parseInt(bet.value);
          if (!isNaN(digit) && digit >= 0 && digit <= 9) betSums[digit] += amount;
        }
      }
      // Find the digit(s) with the lowest bet sum
      const minBet = Math.min(...betSums);
      const candidates = betSums.map((sum, digit) => sum === minBet ? digit : null).filter(d => d !== null);
      // If multiple digits have the same minimum, pick one randomly
      resultNumber = candidates[Math.floor(Math.random() * candidates.length)];
      // End of new logic
    }
    // Settle bets
    let updates = [];
    let totalBets = 0;
    let totalPayout = 0;
    // Custom house edge multipliers
    const EDGE = {
      number: 8.9, // e.g. 8.9x instead of 9x
      color: 2,
      violet: 4.5,
      bigsmall: 2
    };
    // Aggregate total payout per user
    const userPayouts = {};
    for (const bet of bets) {
      totalBets += bet.amount * bet.multiplier;
      let win = false;
      let payout = 0;
      if (bet.type === 'color') {
        if ((bet.value === 'green' && [1,3,7,9].includes(resultNumber)) ||
            (bet.value === 'red' && [2,4,6,8].includes(resultNumber)) ||
            (bet.value === 'violet' && [0,5].includes(resultNumber))) {
          win = true;
          payout = bet.amount * bet.multiplier * (bet.value === 'violet' ? EDGE.violet : EDGE.color);
        }
      }
      if (bet.type === 'bigsmall') {
        if ((bet.value === 'big' && [5,6,7,8,9].includes(resultNumber)) ||
            (bet.value === 'small' && [0,1,2,3,4].includes(resultNumber))) {
          win = true;
          payout = bet.amount * bet.multiplier * EDGE.bigsmall;
        }
      }
      if (bet.type === 'number') {
        if (parseInt(bet.value) === resultNumber) {
          win = true;
          payout = bet.amount * bet.multiplier * EDGE.number;
        }
      }
      totalPayout += payout;
      updates.push(prisma.wingoBet.update({ where: { id: bet.id }, data: { win, payout } }));
      if (win) {
        if (!userPayouts[bet.userId]) userPayouts[bet.userId] = 0;
        userPayouts[bet.userId] += payout;
        console.log(`[Wingo] Will credit user ${bet.userId} with payout ${payout} for round ${roundId}`);
      }
    }
    await Promise.all(updates);
    // Now update each user's balance ONCE
    // Credit each user's balance and emit socket event
    const { io } = await import('../server.js');
    if (Object.keys(userPayouts).length > 0) {
      console.log(`[Wingo] Crediting balances for users:`, userPayouts);
      for (const [userId, payout] of Object.entries(userPayouts)) {
        // Fetch previous balance for logging
        const prevUser = await prisma.user.findUnique({ where: { id: Number(userId) } });
        const prevBalance = prevUser ? prevUser.balance : null;
        const updatedUser = await prisma.user.update({ where: { id: Number(userId) }, data: { balance: { increment: payout } } });
        console.log(`[Wingo] UserID ${userId} payout ${payout} | Previous balance: ${prevBalance} | New balance: ${updatedUser.balance}`);
        // Emit balanceUpdate event to the user
        io.to(`user:${userId}`).emit('balanceUpdate', { userId: Number(userId), balance: updatedUser.balance });
      }
    }
    // Analytics/reporting
    await prisma.wingoRoundAnalytics.create({
      data: {
        roundId: round.id,
        totalBets,
        totalPayout,
        profit: totalBets - totalPayout
      }
    });
    await prisma.wingoRound.update({ where: { id: roundId }, data: { status: "settled", resultNumber, resultAt: new Date() } });
    res.json({ message: "Round settled", resultNumber });
  } catch (e) {
    console.error("Settle round error:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// GET /wingo/history
export const getGameHistory = async (req, res) => {
  try {
    const { interval } = req.query;
    const where = {};
    if (interval) where.interval = interval;
    // Show both pending and settled rounds
    where.status = { in: ["pending", "settled"] };
    console.log("[WingoHistory] Querying for:", where);
    const rounds = await prisma.wingoRound.findMany({
      where,
      orderBy: { endTime: "desc" },
      take: 20,
      include: {
        bets: {
          include: { user: true }
        }
      }
    });
    console.log(`[WingoHistory] Found ${rounds.length} rounds for interval=`, interval);
    if (!rounds || rounds.length === 0) {
      return res.json([]);
    }
    // Add resultBigSmall and resultColor for each round, and structure bets
    const withExtras = rounds.map(r => {
      let resultBigSmall = null, resultColor = null;
      if (typeof r.resultNumber === 'number') {
        if ([5,6,7,8,9].includes(r.resultNumber)) resultBigSmall = 'Big';
        else if ([0,1,2,3,4].includes(r.resultNumber)) resultBigSmall = 'Small';
        if ([1,3,7,9].includes(r.resultNumber)) resultColor = 'green';
        else if ([2,4,6,8,9].includes(r.resultNumber)) resultColor = 'red';
        else if ([0,5].includes(r.resultNumber)) resultColor = 'violet';
      }
      return {
        period: r.period,
        interval: r.interval,
        serialNumber: r.serialNumber,
        resultNumber: r.resultNumber,
        resultBigSmall,
        resultColor,
        resultAt: r.resultAt,
        bets: r.bets.map(bet => ({
          betId: bet.id,
          userId: bet.userId,
          userName: bet.user?.name,
          type: bet.type,
          value: bet.value,
          amount: bet.amount,
          multiplier: bet.multiplier,
          win: bet.win,
          payout: bet.payout
        }))
      };
    });
    res.json(withExtras);
  } catch (e) {
    console.error("[WingoHistory] Error:", e);
    res.status(500).json({ error: "Something went wrong", details: e.message });
  }
};

// GET /wingo/my-bets?userId=xxx
export const getMyBets = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const bets = await prisma.wingoBet.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { round: true, user: true }
    });
    // Add full info for frontend
    const withExtras = bets.map(bet => {
      let resultBigSmall = null, resultColor = null;
      const n = bet.round?.resultNumber;
      if (typeof n === 'number') {
        if ([5,6,7,8,9].includes(n)) resultBigSmall = 'Big';
        else if ([0,1,2,3,4].includes(n)) resultBigSmall = 'Small';
        if ([1,3,7,9].includes(n)) resultColor = 'green';
        else if ([2,4,6,8,9].includes(n)) resultColor = 'red';
        else if ([0,5].includes(n)) resultColor = 'violet';
      }
      let status = '-';
      if (bet.win === true) status = 'Win';
      else if (bet.win === false) status = 'Lose';
      return {
        betId: bet.id,
        userId: bet.userId,
        userName: bet.user?.name,
        period: bet.round?.period,
        interval: bet.round?.interval,
        serialNumber: bet.round?.serialNumber,
        betType: bet.type,
        betValue: bet.value,
        amount: bet.amount,
        multiplier: bet.multiplier,
        createdAt: bet.createdAt,
        status,
        resultNumber: n,
        resultBigSmall,
        resultColor,
        win: bet.win,
        payout: bet.payout
      };
    });
    res.json(withExtras);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
