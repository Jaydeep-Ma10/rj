import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testRandomBet() {
  try {
    console.log('🎲 Testing Random Bet Functionality...\n');

    // 1. Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: { name: 'testuser' }
    });

    if (!testUser) {
      // Generate unique referral code
      const referralCode = 'TEST' + Date.now().toString().slice(-6);
      testUser = await prisma.user.create({
        data: {
          name: 'testuser',
          mobile: '1234567890',
          password: 'hashedpassword',
          balance: 10000,
          referralCode
        }
      });
      console.log('✅ Created test user:', testUser.name);
    } else {
      // Ensure user has enough balance
      await prisma.user.update({
        where: { id: testUser.id },
        data: { balance: 10000 }
      });
      console.log('✅ Found test user:', testUser.name);
    }

    // 2. Get current round for 30s interval
    const currentRound = await prisma.wingoRound.findFirst({
      where: {
        interval: '30s',
        status: 'pending'
      },
      orderBy: { endTime: 'desc' }
    });

    if (!currentRound) {
      console.log('❌ No pending round found for testing');
      return;
    }

    console.log('✅ Found current round:', currentRound.period);

    // 3. Place a random bet
    console.log('\n🎯 Placing random bet...');
    
    const response = await fetch('http://localhost:5000/api/wingo/bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser.id,
        roundId: currentRound.id,
        type: 'random',
        value: 'random',
        amount: 100,
        multiplier: 1
      })
    });

    const betResult = await response.json();
    
    if (response.ok) {
      console.log('✅ Random bet placed successfully:', betResult.bet);
      
      // Check user balance after bet
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      console.log('💰 User balance after bet:', updatedUser.balance);
      
      // Find the created bet
      const createdBet = await prisma.wingoBet.findUnique({
        where: { id: betResult.bet.id }
      });
      console.log('📋 Bet details:', {
        id: createdBet.id,
        type: createdBet.type,
        value: createdBet.value,
        amount: createdBet.amount,
        multiplier: createdBet.multiplier
      });

      console.log('\n🎲 Random bet test completed successfully!');
      console.log('📝 The bet will be settled when the round expires.');
      console.log('🏠 House edge logic will apply to determine the result.');
      
    } else {
      console.log('❌ Failed to place random bet:', betResult);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRandomBet();
