// scripts/testMyBetsAPI.js
import { prisma } from '../prisma/client.js';
import jwt from 'jsonwebtoken';

async function testMyBetsAPI() {
  try {
    console.log('Testing my-bets API endpoint...');
    
    // Get demo user
    const user = await prisma.user.findUnique({
      where: { mobile: '9999000001' }
    });
    
    if (!user) {
      console.log('❌ Demo user not found');
      return;
    }
    
    console.log('✅ Demo user found:', {
      id: user.id,
      name: user.name,
      mobile: user.mobile
    });
    
    // Generate valid JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';
    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('Generated token for testing');
    
    // Check if user has any bets
    const bets = await prisma.wingoBet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
    
    console.log(`Found ${bets.length} bets for user ${user.id}`);
    
    if (bets.length > 0) {
      console.log('\nBet details:');
      bets.forEach((bet, index) => {
        console.log(`${index + 1}. Bet ID: ${bet.id}, Type: ${bet.type}, Value: ${bet.value}, Amount: ${bet.amount}, Win: ${bet.win}, Status: ${bet.status}`);
      });
    } else {
      console.log('No bets found for this user. Creating a test bet...');
      
      // Get current round
      const currentRound = await prisma.wingoRound.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' }
      });
      
      if (currentRound) {
        // Create a test bet
        const testBet = await prisma.wingoBet.create({
          data: {
            userId: user.id,
            roundId: currentRound.id,
            type: 'color',
            value: 'green',
            amount: 100,
            multiplier: 2,
            status: 'pending'
          }
        });
        
        console.log('✅ Created test bet:', testBet.id);
      } else {
        console.log('No active round found to create test bet');
      }
    }
    
    // Test the API endpoint directly
    console.log('\n--- Testing API Response Format ---');
    const apiResponse = await fetch(`http://localhost:5000/api/wingo/my-bets?userId=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('✅ API Response successful');
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', data?.length || 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Sample bet structure:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('Full response:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('❌ API Response failed:', apiResponse.status, apiResponse.statusText);
      const errorText = await apiResponse.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Error testing my-bets API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMyBetsAPI();
