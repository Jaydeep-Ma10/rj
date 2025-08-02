// Money Management Validation Test
// Tests house edge logic with various betting scenarios
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test scenarios for house edge validation
const testScenarios = [
  {
    name: "Scenario 1: Mixed Color Bets",
    bets: [
      { type: 'color', value: 'red', amount: 100 },
      { type: 'color', value: 'green', amount: 200 },
      { type: 'color', value: 'violet', amount: 50 }
    ]
  },
  {
    name: "Scenario 2: Number vs Color",
    bets: [
      { type: 'number', value: '5', amount: 100 },
      { type: 'color', value: 'red', amount: 300 },
      { type: 'bigsmall', value: 'big', amount: 150 }
    ]
  },
  {
    name: "Scenario 3: High Stakes Mixed",
    bets: [
      { type: 'number', value: '0', amount: 1000 },
      { type: 'number', value: '5', amount: 500 },
      { type: 'color', value: 'violet', amount: 800 },
      { type: 'bigsmall', value: 'small', amount: 600 }
    ]
  },
  {
    name: "Scenario 4: Many Small Bets",
    bets: [
      { type: 'color', value: 'red', amount: 50 },
      { type: 'color', value: 'red', amount: 75 },
      { type: 'color', value: 'green', amount: 100 },
      { type: 'bigsmall', value: 'big', amount: 25 },
      { type: 'bigsmall', value: 'small', amount: 40 },
      { type: 'number', value: '7', amount: 30 }
    ]
  }
];

// Calculate payout for each possible result (0-9)
function calculateHouseEdge(bets) {
  const payoutByDigit = {};
  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
  
  for (let digit = 0; digit <= 9; digit++) {
    let totalPayout = 0;
    
    for (const bet of bets) {
      let wins = false;
      let payout = 0;
      
      // Check if this bet wins with this digit
      if (bet.type === 'color') {
        if (
          (bet.value === 'green' && [1,3,7,9].includes(digit)) ||
          (bet.value === 'red' && [2,4,6,8,9].includes(digit)) ||
          (bet.value === 'violet' && [0,5].includes(digit))
        ) {
          wins = true;
          payout = bet.amount * (bet.value === 'violet' ? 4.5 : 2);
        }
      } else if (bet.type === 'bigsmall') {
        if (
          (bet.value === 'big' && [5,6,7,8,9].includes(digit)) ||
          (bet.value === 'small' && [0,1,2,3,4].includes(digit))
        ) {
          wins = true;
          payout = bet.amount * 2;
        }
      } else if (bet.type === 'number') {
        if (Number(bet.value) === digit) {
          wins = true;
          payout = bet.amount * 9;
        }
      }
      
      if (wins) totalPayout += payout;
    }
    
    payoutByDigit[digit] = {
      totalPayout,
      houseProfit: totalBetAmount - totalPayout,
      profitMargin: ((totalBetAmount - totalPayout) / totalBetAmount * 100).toFixed(2) + '%'
    };
  }
  
  return { payoutByDigit, totalBetAmount };
}

// Find optimal digit (minimum payout = maximum house profit)
function findOptimalDigit(payoutByDigit) {
  const minPayout = Math.min(...Object.values(payoutByDigit).map(p => p.totalPayout));
  const optimalDigits = Object.keys(payoutByDigit).filter(
    digit => payoutByDigit[digit].totalPayout === minPayout
  );
  
  return {
    optimalDigits: optimalDigits.map(Number),
    minPayout,
    maxHouseProfit: payoutByDigit[optimalDigits[0]].houseProfit
  };
}

// Run validation tests
async function runMoneyManagementTests() {
  console.log('🧪 MONEY MANAGEMENT VALIDATION TESTS');
  console.log('=====================================\n');
  
  for (const scenario of testScenarios) {
    console.log(`📊 ${scenario.name}`);
    console.log('Bets:', scenario.bets);
    
    const { payoutByDigit, totalBetAmount } = calculateHouseEdge(scenario.bets);
    const optimal = findOptimalDigit(payoutByDigit);
    
    console.log(`💰 Total Bet Amount: ${totalBetAmount}`);
    console.log('📈 Payout Analysis by Digit:');
    
    Object.entries(payoutByDigit).forEach(([digit, data]) => {
      const isOptimal = optimal.optimalDigits.includes(Number(digit));
      console.log(`  Digit ${digit}: Payout=${data.totalPayout}, Profit=${data.houseProfit}, Margin=${data.profitMargin} ${isOptimal ? '⭐ OPTIMAL' : ''}`);
    });
    
    console.log(`🎯 Recommended Digits: ${optimal.optimalDigits.join(', ')}`);
    console.log(`🏠 Maximum House Profit: ${optimal.maxHouseProfit}`);
    console.log(`📊 Best Profit Margin: ${((optimal.maxHouseProfit / totalBetAmount) * 100).toFixed(2)}%`);
    
    // Validate house always profits
    const allDigitsProfit = Object.values(payoutByDigit).every(p => p.houseProfit >= 0);
    console.log(`✅ House Always Profits: ${allDigitsProfit ? 'YES' : 'NO ❌'}`);
    console.log('─'.repeat(50) + '\n');
  }
  
  // Stress test with random scenarios
  console.log('🔥 STRESS TEST: 100 Random Scenarios');
  let allProfitable = true;
  let totalProfit = 0;
  let totalBets = 0;
  
  for (let i = 0; i < 100; i++) {
    const randomBets = generateRandomBets();
    const { payoutByDigit, totalBetAmount } = calculateHouseEdge(randomBets);
    const optimal = findOptimalDigit(payoutByDigit);
    
    totalProfit += optimal.maxHouseProfit;
    totalBets += totalBetAmount;
    
    if (optimal.maxHouseProfit < 0) {
      allProfitable = false;
      console.log(`❌ LOSS SCENARIO ${i + 1}:`, randomBets);
    }
  }
  
  console.log(`📊 Stress Test Results:`);
  console.log(`   Total Scenarios: 100`);
  console.log(`   All Profitable: ${allProfitable ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   Total Bets: ${totalBets}`);
  console.log(`   Total House Profit: ${totalProfit}`);
  console.log(`   Average Profit Margin: ${((totalProfit / totalBets) * 100).toFixed(2)}%`);
}

// Generate random betting scenario
function generateRandomBets() {
  const betTypes = ['color', 'bigsmall', 'number'];
  const colorValues = ['red', 'green', 'violet'];
  const bigsmallValues = ['big', 'small'];
  const numberValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  const numBets = Math.floor(Math.random() * 10) + 1; // 1-10 bets
  const bets = [];
  
  for (let i = 0; i < numBets; i++) {
    const type = betTypes[Math.floor(Math.random() * betTypes.length)];
    let value;
    
    switch (type) {
      case 'color':
        value = colorValues[Math.floor(Math.random() * colorValues.length)];
        break;
      case 'bigsmall':
        value = bigsmallValues[Math.floor(Math.random() * bigsmallValues.length)];
        break;
      case 'number':
        value = numberValues[Math.floor(Math.random() * numberValues.length)];
        break;
    }
    
    const amount = Math.floor(Math.random() * 1000) + 10; // 10-1010
    bets.push({ type, value, amount });
  }
  
  return bets;
}

// Run the tests
runMoneyManagementTests().catch(console.error);
