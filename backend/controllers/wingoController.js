import { prisma } from '../prisma/client.js';

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
  // Start transaction
  return await prisma.$transaction(async (prisma) => {
    try {
      console.log('[Wingo] Received bet request:', req.body);
      const { userId, roundId, type, value, amount, multiplier } = req.body;
      const idempotencyKey = req.idempotencyKey;
      
      // Validate required fields
      if (!userId || !roundId || !type || !value || amount == null || multiplier == null) {
        throw new Error('Missing required fields');
      }

      // Check for existing bet with same idempotency key
      if (idempotencyKey) {
        const existingBet = await prisma.wingoBet.findFirst({
          where: { idempotencyKey }
        });
        
        if (existingBet) {
          console.log(`[Wingo] Duplicate request with idempotency key: ${idempotencyKey}`);
          return res.json({ 
            success: true, 
            bet: existingBet,
            message: 'Duplicate request - bet already placed'
          });
        }
      }

      // Get round with locking to prevent concurrent modifications
      const round = await prisma.wingoRound.findUnique({
        where: { id: roundId },
        select: { endTime: true, status: true }
      });

      if (!round) {
        throw new Error('Round not found');
      }

      // Check if betting is allowed (not in last 5 seconds)
      const now = new Date();
      const timeLeftMs = new Date(round.endTime) - now;
      if (timeLeftMs <= 5000) {
        throw new Error('Betting is closed for the last 5 seconds of each round');
      }

      if (round.status !== 'pending') {
        throw new Error('Betting is closed for this round');
      }

      // Get user with locking to prevent race conditions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, balance: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Validate balance
      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create bet and update balance in single transaction
      const [bet] = await Promise.all([
        prisma.wingoBet.create({
          data: { 
            userId, 
            roundId, 
            type, 
            value: String(value), 
            amount: parseFloat(amount), 
            multiplier: parseInt(multiplier),
            idempotencyKey,
            status: 'pending'
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: parseFloat(amount) } }
        })
      ]);

      console.log(`[Wingo] Bet placed successfully:`, bet);
      return res.json({ 
        success: true, 
        bet,
        message: 'Bet placed successfully',
        idempotencyKey
      });
      
    } catch (error) {
      console.error('[Wingo] Bet placement error:', error);
      
      // Handle unique constraint violation
      if (error.code === 'P2002' || error.message.includes('unique constraint')) {
        // Try to find the existing bet
        const existingBet = await prisma.wingoBet.findFirst({
          where: { idempotencyKey: req.idempotencyKey }
        });
        
        if (existingBet) {
          return res.json({ 
            success: true, 
            bet: existingBet,
            message: 'Duplicate request - bet already placed'
          });
        }
        
        return res.status(409).json({ 
          success: false, 
          error: 'Duplicate bet detected',
          code: 'DUPLICATE_BET'
        });
      }
      
          // Handle other errors
      return res.status(400).json({ 
        success: false, 
        error: error.message || 'Failed to place bet',
        code: error.code || 'BET_PLACEMENT_ERROR',
        idempotencyKey: req.idempotencyKey
      });
    }
  }).catch(transactionError => {
    console.error("Wingo bet transaction error:", transactionError);
    return res.status(500).json({ 
      success: false,
      error: 'Transaction failed',
      details: transactionError.message 
    });
  });
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
  // Start transaction
  return await prisma.$transaction(async (prisma) => {
    console.log('[Wingo] Starting round settlement for roundId:', req.body?.roundId);
    
    const { roundId } = req.body;
    if (!roundId) {
      throw new Error('Round ID is required');
    }

      // Get round with all bets, with row locking
      const round = await prisma.wingoRound.findUnique({
        where: { id: roundId },
        include: { 
          bets: {
            include: { user: true }
          } 
        },
        lock: { mode: 'pessimistic_write' }
      });

      if (!round) {
        throw new Error('Round not found');
      }

      if (round.status !== 'pending') {
        console.log(`[Wingo] Round ${roundId} already settled as ${round.status}`);
        return res.json({ 
          success: true, 
          message: `Round already ${round.status}`,
          roundId: round.id,
          status: round.status
        });
      }

      const bets = round.bets;
    let resultNumber;
    
    try {
      // 1. Determine result number based on bet types and amounts
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
    } catch (error) {
      console.error('[Wingo] Error determining result number:', error);
      throw new Error('Failed to determine round result');
    }
    // Initialize settlement tracking
    const settlement = {
      updates: [],
      totalBets: 0,
      totalPayout: 0,
      userPayouts: {}
    };
    // Custom house edge multipliers
    const EDGE = {
      number: 8.9, // e.g. 8.9x instead of 9x
      color: 2,
      violet: 4.5,
      bigsmall: 2
    };
    // Process each bet
    for (const bet of bets) {
      settlement.totalBets += bet.amount * bet.multiplier;
      const betResult = {
        win: false,
        payout: 0
      };
      if (bet.type === 'color') {
        if ((bet.value === 'green' && [1,3,7,9].includes(resultNumber)) ||
            (bet.value === 'red' && [2,4,6,8].includes(resultNumber)) ||
            (bet.value === 'violet' && [0,5].includes(resultNumber))) {
          betResult.win = true;
          betResult.payout = bet.amount * bet.multiplier * (bet.value === 'violet' ? EDGE.violet : EDGE.color);
        }
      }
      if (bet.type === 'bigsmall') {
        if ((bet.value === 'big' && resultNumber >= 5) ||
            (bet.value === 'small' && resultNumber < 5)) {
          betResult.win = true;
          betResult.payout = bet.amount * bet.multiplier * EDGE.bigsmall;
        }
      }
      if (bet.type === 'number') {
        if (parseInt(bet.value) === resultNumber) {
          betResult.win = true;
          betResult.payout = bet.amount * bet.multiplier * EDGE.number;
        }
      }
      settlement.totalPayout += betResult.payout;
      settlement.updates.push(prisma.wingoBet.update({ where: { id: bet.id }, data: { win: betResult.win, payout: betResult.payout } }));
      if (betResult.win) {
        if (!settlement.userPayouts[bet.userId]) settlement.userPayouts[bet.userId] = 0;
        settlement.userPayouts[bet.userId] += betResult.payout;
        console.log(`[Wingo] Will credit user ${bet.userId} with payout ${betResult.payout} for round ${roundId}`);
        if (!userPayouts[bet.userId]) userPayouts[bet.userId] = 0;
        userPayouts[bet.userId] += payout;
        console.log(`[Wingo] Will credit user ${bet.userId} with payout ${payout} for round ${roundId}`);
      }
    }
    // Update all bets in parallel
    await Promise.all(settlement.updates);
    
    // Credit each user's balance and emit socket event
    const payoutUsers = Object.entries(settlement.userPayouts);
    
    if (payoutUsers.length > 0) {
      console.log(`[Wingo] Crediting balances for users:`, settlement.userPayouts);
      
      for (const [userId, payout] of payoutUsers) {
        try {
          // Fetch previous balance for logging
          const prevUser = await prisma.user.findUnique({ 
            where: { id: Number(userId) },
            select: { balance: true }
          });
          
          const prevBalance = prevUser ? prevUser.balance : 0;
          const updatedUser = await prisma.user.update({ 
            where: { id: Number(userId) }, 
            data: { balance: { increment: parseFloat(payout) } } 
          });
          console.log(`[Wingo] UserID ${userId} payout ${payout} | Previous balance: ${prevBalance} | New balance: ${updatedUser.balance}`);
          
          // Emit balanceUpdate event to the user if socket.io is available
          if (global.io) {
            global.io.to(`user:${userId}`).emit('balanceUpdate', { 
              userId: Number(userId), 
              balance: updatedUser.balance 
            });
          }
        } catch (userError) {
          console.error(`[Wingo] Error updating user ${userId} balance:`, userError);
          // Continue with next user even if one fails
          continue;
        }
      }
    }
    
    // Process each bet to determine win/loss and calculate payouts
    for (const bet of bets) {
      const betResult = {
        win: false,
        payout: 0
      };
      
      // Calculate win/loss based on bet type and result
      if (bet.type === 'color') {
        const colors = {
          green: [1, 3, 7, 9],
          red: [2, 4, 6, 8],
          violet: [0, 5]
        };
        betResult.win = colors[bet.value]?.includes(resultNumber) || false;
        betResult.payout = betResult.win ? bet.amount * bet.multiplier * (bet.value === 'violet' ? 4.5 : 2) : 0;
      } else if (bet.type === 'bigsmall') {
        const isBig = [5, 6, 7, 8, 9].includes(resultNumber);
        betResult.win = (bet.value === 'big' && isBig) || (bet.value === 'small' && !isBig);
        betResult.payout = betResult.win ? bet.amount * bet.multiplier * 2 : 0;
      } 
      else if (bet.type === 'number') {
        betResult.win = parseInt(bet.value) === resultNumber;
        betResult.payout = betResult.win ? bet.amount * bet.multiplier * 9 : 0;
      }
      
      // Track payouts per user
      if (betResult.win && betResult.payout > 0) {
        userPayouts.set(bet.userId, (userPayouts.get(bet.userId) || 0) + betResult.payout);
      }
      
      // Queue bet update
      betUpdates.push(
        prisma.wingoBet.update({
          where: { id: bet.id },
          data: { 
            win: betResult.win, 
            payout: betResult.payout,
            status: 'settled'
          }
        })
      );
    }
    
    // 3. Update user balances with their winnings
    const userUpdates = [];
    for (const [userId, amount] of userPayouts.entries()) {
      userUpdates.push(
        prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } }
        })
      );
    }
    
    // 4. Update round status and record analytics
    const roundUpdate = prisma.wingoRound.update({ 
      where: { id: roundId }, 
      data: { 
        status: "settled", 
        resultNumber, 
        resultAt: new Date() 
      } 
    });
    
    // 5. Record round analytics
    const totalBets = bets.reduce((sum, bet) => sum + (bet.amount * bet.multiplier), 0);
    const totalPayout = Array.from(userPayouts.values()).reduce((sum, amount) => sum + amount, 0);
    
    const analyticsCreate = prisma.wingoRoundAnalytics.create({
      data: {
        roundId: round.id,
        totalBets,
        totalPayout,
        profit: totalBets - totalPayout
      }
    });
    
    // 6. Execute all updates in a single transaction
    await Promise.all([
      ...betUpdates,
      ...userUpdates,
      roundUpdate,
      analyticsCreate
    ]);
    
    console.log(`[Wingo] Round ${roundId} settled successfully with result ${resultNumber}`);
    
    // 7. Emit socket events for real-time updates
    if (global.io) {
      try {
        global.io.emit('round:settled', { 
          roundId: round.id,
          resultNumber,
          status: 'settled'
        });
      } catch (socketError) {
        console.error('[Wingo] Error emitting socket event:', socketError);
        // Don't fail the request if socket emit fails
      }
    }
    
    return res.json({ 
      success: true, 
      message: "Round settled successfully",
      resultNumber,
      totalBets: settlement.totalBets,
      totalPayout: settlement.totalPayout
    });
  }).catch(error => {
    console.error('[Wingo] Transaction failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to settle round',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  });
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
    console.log('getMyBets called with query:', req.query);
    const { userId } = req.query;
    
    if (!userId) {
      console.log('Missing userId in query');
      return res.status(400).json({ error: "Missing userId" });
    }

    // Parse userId to integer safely
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.log('Invalid userId format:', userId);
      return res.status(400).json({ error: "Invalid userId format" });
    }

    console.log('Fetching bets for userId:', parsedUserId);
    
    const bets = await prisma.wingoBet.findMany({
      where: { userId: parsedUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { 
        round: true, 
        user: {
          select: {
            id: true,
            name: true,
            mobile: true
          }
        } 
      }
    });

    console.log(`Found ${bets.length} bets for user ${parsedUserId}`);
    
    // Add full info for frontend
    const withExtras = bets.map(bet => {
      try {
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
        
        const result = {
          betId: bet.id,
          userId: bet.userId,
          userName: bet.user?.name || 'Unknown',
          period: bet.round?.period || null,
          interval: bet.round?.interval || null,
          serialNumber: bet.round?.serialNumber || null,
          betType: bet.type,
          betValue: bet.value,
          amount: bet.amount,
          multiplier: bet.multiplier || 1,
          createdAt: bet.createdAt,
          status,
          resultNumber: n !== undefined ? n : null,
          resultBigSmall,
          resultColor,
          win: bet.win,
          payout: bet.payout || 0
        };
        
        return result;
      } catch (mapError) {
        console.error('Error mapping bet:', mapError);
        console.error('Problematic bet data:', JSON.stringify(bet, null, 2));
        return null;
      }
    }).filter(Boolean); // Remove any null entries from mapping errors

    console.log('Returning bets data');
    res.json(withExtras);
  } catch (e) {
    console.error('Error in getMyBets:', e);
    
    // Check for common database errors
    let errorMessage = "Failed to fetch user bets";
    let statusCode = 500;
    
    if (e.code === 'P1001' || e.code === 'P1017') {
      // Database connection errors
      errorMessage = "Database connection error. Please try again later.";
      statusCode = 503; // Service Unavailable
    } else if (e.code === 'P2025') {
      // Record not found
      errorMessage = "User not found";
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? e.message : undefined,
      code: e.code
    });
  }
};
