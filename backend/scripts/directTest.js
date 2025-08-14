// Simple script to test /wingo/my-bets endpoint with a known user ID
import http from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 10000;
const USER_ID = 1; // Try with a known user ID from your database

// Make the request
console.log(`Testing /wingo/my-bets?userId=${USER_ID}`);

const options = {
  hostname: 'localhost',
  port: PORT,
  path: `/wingo/my-bets?userId=${USER_ID}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // Add any required headers here
  }
};

console.log('Making request to:', `http://localhost:${PORT}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`\n=== RESPONSE ===`);
  console.log(`Status Code: ${res.statusCode} ${http.STATUS_CODES[res.statusCode]}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = Buffer.alloc(0);
  
  res.on('data', (chunk) => {
    data = Buffer.concat([data, Buffer.from(chunk)]);
  });
  
  res.on('end', () => {
    console.log('\n=== RESPONSE BODY ===');
    
    // Try to parse as JSON first
    try {
      const json = JSON.parse(data.toString());
      console.log('JSON Response:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      // If not JSON, try to decode as text
      console.log('Raw Response (first 1000 chars):');
      const text = data.toString('utf8');
      console.log(text.length > 1000 ? text.substring(0, 1000) + '...' : text);
      
      // Try to detect if it's HTML
      if (text.trim().toLowerCase().startsWith('<!doctype html>') || 
          text.trim().toLowerCase().startsWith('<html>')) {
        console.log('\n⚠️ Received HTML response. The server might be returning an error page.');
        
        // Extract title if present
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          console.log(`Page Title: ${titleMatch[1]}`);
        }
      }
    }
    
    console.log('\n=== END OF RESPONSE ===');
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
  process.exit(1);
});

req.end();
