import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_development_only';

// The token from simpleTestMyBets.js
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzU1MTc2NDY0LCJleHAiOjE3NTUyNjI4NjR9.Kt2mO-UgqCKthRRvTJRz1hS7X7RBae5Zk3bY08bR9Ow';

console.log('=== Token Analysis ===');
console.log(`Token: ${token}\n`);

// 1. Split the token into its parts
const tokenParts = token.split('.');
console.log('Token Parts:');
console.log(`- Header: ${tokenParts[0]}`);
console.log(`- Payload: ${tokenParts[1]}`);
console.log(`- Signature: ${tokenParts[2].substring(0, 10)}...`);
console.log('');

// 2. Decode without verification
console.log('1. Decoding token without verification:');
try {
  const decodedWithoutVerify = jwt.decode(token, { complete: true });
  console.log('Header:', JSON.stringify(decodedWithoutVerify.header, null, 2));
  console.log('Payload:', JSON.stringify(decodedWithoutVerify.payload, null, 2));
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (decodedWithoutVerify.payload.exp < now) {
    console.log(`❌ Token expired ${Math.round((now - decodedWithoutVerify.payload.exp) / 3600)} hours ago`);
  } else {
    console.log(`✅ Token expires in ${Math.round((decodedWithoutVerify.payload.exp - now) / 3600)} hours`);
  }
  
} catch (e) {
  console.error('Error decoding token:', e);
}

console.log('\n2. Verifying token with JWT_SECRET...');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token is valid');
  console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
  
  // Check for required fields
  console.log('\n3. Checking for required fields:');
  const requiredFields = ['userId'];
  let hasAllFields = true;
  
  requiredFields.forEach(field => {
    if (!decoded[field]) {
      console.log(`❌ Missing required field: ${field}`);
      hasAllFields = false;
    } else {
      console.log(`✅ Found required field: ${field} = ${decoded[field]}`);
    }
  });
  
  console.log('\n4. Additional token fields:');
  Object.entries(decoded).forEach(([key, value]) => {
    if (!requiredFields.includes(key)) {
      console.log(`- ${key}: ${JSON.stringify(value)}`);
    }
  });
  
  if (!hasAllFields) {
    console.log('\n❌ Token is missing required fields for authentication');
    console.log('The auth middleware expects a token with a userId field');
  }
  
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
  if (error.name === 'JsonWebTokenError') {
    console.log('This usually means the JWT_SECRET used to sign the token does not match');
    console.log(`Using JWT_SECRET: ${JWT_SECRET ? 'Set' : 'Not set'}`);
  } else if (error.name === 'TokenExpiredError') {
    console.log('The token has expired');
  }
  
  // Try to get more details about the error
  try {
    const decoded = jwt.decode(token);
    console.log('\nDecoded token (unverified):', JSON.stringify(decoded, null, 2));
  } catch (e) {
    console.error('Could not decode token:', e);
  }
}
