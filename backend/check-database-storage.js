import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseStorage() {
  try {
    console.log('🔍 CHECKING IF RESULTS ARE STORED IN DATABASE...\n');
    
    // Check recent rounds with their storage status
    const rounds = await prisma.wingoRound.findMany({
      orderBy: { id: 'desc' },
      take: 10,
      include: { bets: true }
    });
    
    console.log('📊 RECENT ROUNDS ANALYSIS:');
    console.log('='.repeat(60));
    
    rounds.forEach((round, index) => {
      console.log(`${index + 1}. Round ID: ${round.id}`);
      console.log(`   Status: ${round.status}`);
      console.log(`   Result Number: ${round.resultNumber}`);
      console.log(`   Result At: ${round.resultAt}`);
      console.log(`   Bets Count: ${round.bets.length}`);
      console.log(`   Period: ${round.period}`);
      console.log(`   Interval: ${round.interval}`);
      
      // Check storage status
      if (round.status === 'settled') {
        if (round.resultNumber !== null && round.resultNumber !== undefined) {
          console.log(`   ✅ STORED: Result ${round.resultNumber} is saved in database`);
        } else {
          console.log(`   ❌ NOT STORED: Result is NULL/undefined in database`);
        }
      } else {
        console.log(`   ⏳ PENDING: Round not yet settled`);
      }
      console.log('');
    });
    
    // Count storage statistics
    const totalRounds = await prisma.wingoRound.count();
    const settledRounds = await prisma.wingoRound.count({
      where: { status: 'settled' }
    });
    const storedResults = await prisma.wingoRound.count({
      where: { 
        status: 'settled',
        resultNumber: { not: null }
      }
    });
    const nullResults = await prisma.wingoRound.count({
      where: { 
        status: 'settled',
        resultNumber: null
      }
    });
    
    console.log('📈 STORAGE STATISTICS:');
    console.log('='.repeat(60));
    console.log(`Total Rounds: ${totalRounds}`);
    console.log(`Settled Rounds: ${settledRounds}`);
    console.log(`Stored Results: ${storedResults}`);
    console.log(`NULL Results: ${nullResults}`);
    
    if (nullResults === 0) {
      console.log('\n✅ SUCCESS: All settled rounds have results stored in database!');
    } else {
      console.log(`\n❌ PROBLEM: ${nullResults} settled rounds have NULL results!`);
    }
    
    // Check specific no-bet rounds
    console.log('\n🎲 NO-BET ROUNDS CHECK:');
    console.log('='.repeat(60));
    
    const allSettled = await prisma.wingoRound.findMany({
      where: { status: 'settled' },
      include: { bets: true },
      orderBy: { id: 'desc' },
      take: 20
    });
    
    const noBetRounds = allSettled.filter(r => r.bets.length === 0);
    
    console.log(`Found ${noBetRounds.length} no-bet rounds in last 20 settled rounds:`);
    
    noBetRounds.forEach((round, index) => {
      console.log(`${index + 1}. Round ${round.id}: Result = ${round.resultNumber} (${round.resultNumber !== null ? 'STORED' : 'NULL'})`);
    });
    
    if (noBetRounds.length > 0) {
      const storedNoBetResults = noBetRounds.filter(r => r.resultNumber !== null).length;
      console.log(`\n📊 No-bet rounds with stored results: ${storedNoBetResults}/${noBetRounds.length}`);
      
      if (storedNoBetResults === noBetRounds.length) {
        console.log('✅ ALL no-bet rounds have results stored in database!');
      } else {
        console.log('❌ SOME no-bet rounds have NULL results in database!');
      }
    } else {
      console.log('ℹ️  No recent no-bet rounds found (all had bets placed)');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStorage();
