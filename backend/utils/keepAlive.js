// Keep server alive on Render free tier
import fetch from 'node-fetch';

const SERVER_URL = process.env.PUBLIC_URL || 'https://your-render-app.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

export function initKeepAlive() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Starting keep-alive service for Render free tier');
    
    setInterval(async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/health`);
        console.log(`✅ Keep-alive ping: ${response.status}`);
      } catch (error) {
        console.error('❌ Keep-alive ping failed:', error.message);
      }
    }, PING_INTERVAL);
  }
}
