import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyRandomBetSettlement() {
  try {
    console.log('🔍 Verifying Random Bet Settlement...\n');

    // Find the random bet we just placed
    const randomBet = await prisma.wingoBet.findFirst({
      where: {
        type: 'random',
        value: 'random'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        round: true,
        user: true
      }
    });

    if (!randomBet) {
      console.log('❌ No random bet found');
      return;
    }

    console.log('✅ Found Random Bet:');
    console.log('   Bet ID:', randomBet.id);
    console.log('   User:', randomBet.user.name);
    console.log('   Round Period:', randomBet.round.period);
    console.log('   Round Status:', randomBet.round.status);
    console.log('   Bet Amount:', randomBet.amount);
    console.log('   Bet Type:', randomBet.type);
    console.log('   Bet Value:', randomBet.value);
    console.log('   Created At:', randomBet.createdAt);

    if (randomBet.round.status === 'settled') {
      console.log('\n🎯 SETTLEMENT RESULTS:');
      console.log('   Result Number:', randomBet.round.resultNumber);
      console.log('   Bet Won:', randomBet.win ? '✅ YES' : '❌ NO');
      console.log('   Payout:', randomBet.payout || 0);
      
      // Check user's final balance
      const user = await prisma.user.findUnique({
        where: { id: randomBet.userId }
      });
      console.log('   User Final Balance:', user.balance);

      if (randomBet.win) {
        console.log('\n🎉 RANDOM BET WON!');
        console.log('   Expected Payout: 9x =', randomBet.amount * 9);
        console.log('   Actual Payout:', randomBet.payout);
        console.log('   Payout Correct:', randomBet.payout === randomBet.amount * 9 ? '✅' : '❌');
      } else {
        console.log('\n💔 Random bet lost, but that\'s expected with house edge!');
      }
    } else {
      console.log('\n⏳ Round still pending settlement...');
      console.log('   Round End Time:', randomBet.round.endTime);
      console.log('   Current Time:', new Date());
    }

    // Show all random bets for comprehensive testing
    console.log('\n📊 ALL RANDOM BETS IN SYSTEM:');
    const allRandomBets = await prisma.wingoBet.findMany({
      where: { type: 'random' },
      include: {
        round: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    allRandomBets.forEach((bet, index) => {
      console.log(`   ${index + 1}. User: ${bet.user.name}, Amount: ${bet.amount}, Round: ${bet.round.period}, Status: ${bet.round.status}, Won: ${bet.win ? 'YES' : 'NO'}, Payout: ${bet.payout || 0}`);
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyRandomBetSettlement();
