// SMS Service for OTP delivery
// Supports multiple SMS providers with fallback options

import fetch from 'node-fetch';

// SMS Provider configurations
const SMS_PROVIDERS = {
  // Twilio Configuration
  TWILIO: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    enabled: process.env.SMS_PROVIDER === 'twilio'
  },
  
  // TextLocal Configuration (India)
  TEXTLOCAL: {
    apiKey: process.env.TEXTLOCAL_API_KEY,
    sender: process.env.TEXTLOCAL_SENDER || 'WINGO',
    enabled: process.env.SMS_PROVIDER === 'textlocal'
  },
  
  // AWS SNS Configuration
  AWS_SNS: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    enabled: process.env.SMS_PROVIDER === 'aws'
  },
  
  // Fast2SMS Configuration (India)
  FAST2SMS: {
    apiKey: process.env.FAST2SMS_API_KEY,
    sender: process.env.FAST2SMS_SENDER || 'WINGO',
    enabled: process.env.SMS_PROVIDER === 'fast2sms'
  }
};

// Format mobile number for international format
function formatMobileNumber(mobile, countryCode = '+91') {
  // Remove all non-digit characters
  const cleanMobile = mobile.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleanMobile.length === 10 && !cleanMobile.startsWith('91')) {
    return `${countryCode}${cleanMobile}`;
  }
  
  if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
    return `+${cleanMobile}`;
  }
  
  return mobile;
}

// Twilio SMS Implementation
async function sendViaTwilio(mobile, message) {
  const { accountSid, authToken, fromNumber } = SMS_PROVIDERS.TWILIO;
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio configuration missing');
  }
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: formatMobileNumber(mobile),
      Body: message
    })
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Twilio error: ${result.message}`);
  }
  
  return { success: true, messageId: result.sid, provider: 'twilio' };
}

// TextLocal SMS Implementation (India)
async function sendViaTextLocal(mobile, message) {
  const { apiKey, sender } = SMS_PROVIDERS.TEXTLOCAL;
  
  if (!apiKey) {
    throw new Error('TextLocal configuration missing');
  }
  
  const url = 'https://api.textlocal.in/send/';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      apikey: apiKey,
      numbers: mobile.replace(/\D/g, ''), // Remove non-digits for TextLocal
      message: message,
      sender: sender
    })
  });
  
  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(`TextLocal error: ${result.errors?.[0]?.message || 'Unknown error'}`);
  }
  
  return { success: true, messageId: result.messages[0]?.id, provider: 'textlocal' };
}

// Fast2SMS Implementation (India)
async function sendViaFast2SMS(mobile, message) {
  const { apiKey, sender } = SMS_PROVIDERS.FAST2SMS;
  
  if (!apiKey) {
    throw new Error('Fast2SMS configuration missing');
  }
  
  const url = 'https://www.fast2sms.com/dev/bulkV2';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'v3',
      sender_id: sender,
      message: message,
      language: 'english',
      flash: 0,
      numbers: mobile.replace(/\D/g, '')
    })
  });
  
  const result = await response.json();
  
  if (!result.return) {
    throw new Error(`Fast2SMS error: ${result.message || 'Unknown error'}`);
  }
  
  return { success: true, messageId: result.job_id, provider: 'fast2sms' };
}

// Main SMS sending function with provider fallback
export async function sendSMS(mobile, message, options = {}) {
  const { retryCount = 2, timeout = 10000 } = options;
  
  // Determine active provider
  const activeProvider = process.env.SMS_PROVIDER || 'mock';
  
  // Mock implementation for development/testing
  if (activeProvider === 'mock' || process.env.NODE_ENV === 'development') {
    console.log(`📱 [MOCK SMS] To: ${mobile}`);
    console.log(`📱 [MOCK SMS] Message: ${message}`);
    return { success: true, messageId: `mock_${Date.now()}`, provider: 'mock' };
  }
  
  const providers = [
    { name: 'twilio', fn: sendViaTwilio, enabled: SMS_PROVIDERS.TWILIO.enabled },
    { name: 'textlocal', fn: sendViaTextLocal, enabled: SMS_PROVIDERS.TEXTLOCAL.enabled },
    { name: 'fast2sms', fn: sendViaFast2SMS, enabled: SMS_PROVIDERS.FAST2SMS.enabled }
  ];
  
  // Try active provider first, then fallback to others
  const sortedProviders = providers.sort((a, b) => {
    if (a.name === activeProvider) return -1;
    if (b.name === activeProvider) return 1;
    return 0;
  });
  
  let lastError;
  
  for (const provider of sortedProviders) {
    if (!provider.enabled) continue;
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        console.log(`📱 Sending SMS via ${provider.name} (attempt ${attempt + 1})`);
        
        const result = await Promise.race([
          provider.fn(mobile, message),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('SMS timeout')), timeout)
          )
        ]);
        
        console.log(`✅ SMS sent successfully via ${provider.name}:`, result.messageId);
        return result;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ SMS failed via ${provider.name} (attempt ${attempt + 1}):`, error.message);
        
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        }
      }
    }
  }
  
  throw new Error(`All SMS providers failed. Last error: ${lastError?.message}`);
}

// Send OTP SMS with predefined template
export async function sendOTPSMS(mobile, otp, options = {}) {
  const message = `Your Wingo account password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
  
  return await sendSMS(mobile, message, options);
}

// Validate mobile number format
export function validateMobileNumber(mobile) {
  const cleanMobile = mobile.replace(/\D/g, '');
  
  // Indian mobile number validation (10 digits)
  if (cleanMobile.length === 10 && /^[6-9]/.test(cleanMobile)) {
    return { valid: true, formatted: `+91${cleanMobile}` };
  }
  
  // International format validation (with country code)
  if (cleanMobile.length >= 10 && cleanMobile.length <= 15) {
    return { valid: true, formatted: `+${cleanMobile}` };
  }
  
  return { valid: false, error: 'Invalid mobile number format' };
}
