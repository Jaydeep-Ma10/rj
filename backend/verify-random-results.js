import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRandomResults() {
  try {
    console.log('🔍 Verifying Random Results in Database...\n');
    
    // Get recent settled rounds
    const recentRounds = await prisma.wingoRound.findMany({
      where: { 
        status: 'settled',
        resultNumber: { not: null }
      },
      orderBy: { resultAt: 'desc' },
      take: 10,
      include: { 
        bets: {
          select: {
            id: true,
            amount: true,
            type: true,
            value: true
          }
        }
      }
    });

    console.log(`📊 Found ${recentRounds.length} recent settled rounds:\n`);
    
    let noBetsCount = 0;
    let singleBetCount = 0;
    let multipleBetsCount = 0;
    
    recentRounds.forEach((round, index) => {
      const betCount = round.bets.length;
      const resultNumber = round.resultNumber;
      const period = round.period;
      const interval = round.interval;
      
      console.log(`${index + 1}. Round ID: ${round.id}`);
      console.log(`   Period: ${period} | Interval: ${interval}`);
      console.log(`   Result: ${resultNumber} | Bets: ${betCount}`);
      
      if (betCount === 0) {
        noBetsCount++;
        console.log(`   🎲 NO BETS - Random result: ${resultNumber}`);
      } else if (betCount === 1) {
        singleBetCount++;
        const bet = round.bets[0];
        console.log(`   🎯 SINGLE BET - ${bet.type}:${bet.value} ₹${bet.amount} → Result: ${resultNumber}`);
      } else {
        multipleBetsCount++;
        console.log(`   🏠 MULTIPLE BETS (${betCount}) → House edge result: ${resultNumber}`);
      }
      console.log('');
    });
    
    // Summary
    console.log('📈 SUMMARY:');
    console.log(`   • No Bets Rounds: ${noBetsCount}`);
    console.log(`   • Single Bet Rounds: ${singleBetCount}`);
    console.log(`   • Multiple Bets Rounds: ${multipleBetsCount}`);
    console.log(`   • Total Verified: ${recentRounds.length}`);
    
    // Check if results are properly stored
    const nullResults = await prisma.wingoRound.count({
      where: {
        status: 'settled',
        resultNumber: null
      }
    });
    
    console.log(`\n🔍 INTEGRITY CHECK:`);
    console.log(`   • Settled rounds with NULL results: ${nullResults}`);
    
    if (nullResults === 0) {
      console.log('   ✅ All settled rounds have valid results!');
    } else {
      console.log('   ❌ Found settled rounds with missing results!');
    }
    
    // Check for recent no-bet rounds specifically
    const noBetRounds = await prisma.wingoRound.findMany({
      where: {
        status: 'settled',
        resultNumber: { not: null }
      },
      include: {
        bets: true
      },
      orderBy: { resultAt: 'desc' },
      take: 20
    });
    
    const actualNoBetRounds = noBetRounds.filter(r => r.bets.length === 0);
    
    console.log(`\n🎲 NO-BET ROUNDS VERIFICATION:`);
    console.log(`   • Found ${actualNoBetRounds.length} no-bet rounds in last 20 settled rounds`);
    
    if (actualNoBetRounds.length > 0) {
      console.log('   • Results from no-bet rounds:');
      actualNoBetRounds.slice(0, 5).forEach(r => {
        console.log(`     - Round ${r.id}: Result = ${r.resultNumber}`);
      });
      console.log('   ✅ No-bet rounds ARE generating and storing results!');
    } else {
      console.log('   ⚠️  No recent no-bet rounds found (all rounds had bets)');
    }

  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRandomResults();
