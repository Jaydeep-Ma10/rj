# Mobile-Based Password Reset System

## 🎯 Overview
Secure password reset system using mobile number verification with OTP (One-Time Password) for the Wingo betting platform.

## 🔐 Security Features
- **6-digit OTP**: Cryptographically secure random generation
- **Time-limited tokens**: 10-minute OTP expiry, 15-minute reset token expiry
- **Rate limiting**: 2-minute cooldown between OTP requests
- **Single-use tokens**: OTPs become invalid after verification
- **Mobile validation**: Format validation and sanitization
- **Secure password hashing**: bcrypt with salt rounds

## 📱 SMS Integration
Supports multiple SMS providers with automatic fallback:
- **Twilio** (International)
- **TextLocal** (India)
- **Fast2SMS** (India)
- **AWS SNS** (Global)
- **Mock mode** (Development/Testing)

## 🔄 Password Reset Flow

### Step 1: Request OTP
```
POST /api/password-reset/request-otp
Content-Type: application/json

{
  "mobile": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your mobile number",
  "expiresIn": "10 minutes"
}
```

### Step 2: Verify OTP
```
POST /api/password-reset/verify-otp
Content-Type: application/json

{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "resetToken": "123456789012",
  "expiresIn": "15 minutes"
}
```

### Step 3: Reset Password
```
POST /api/password-reset/reset-password
Content-Type: application/json

{
  "mobile": "9876543210",
  "resetToken": "123456789012",
  "newPassword": "newSecurePass123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password.",
  "user": {
    "id": 15,
    "name": "john_doe",
    "mobile": "9876543210"
  }
}
```

## 🗄️ Database Schema

### PasswordReset Model
```prisma
model PasswordReset {
  id        Int      @id @default(autoincrement())
  mobile    String   // User's mobile number
  otp       String   // OTP or reset token
  isUsed    Boolean  @default(false) // OTP usage status
  expiresAt DateTime // Expiration timestamp
  createdAt DateTime @default(now())
  userId    Int?     // Reference to user
  user      User?    @relation(fields: [userId], references: [id])

  @@index([mobile])
  @@index([otp])
  @@index([expiresAt])
}
```

## ⚙️ Environment Configuration

Add these environment variables for SMS providers:

```env
# SMS Provider Selection
SMS_PROVIDER=mock  # Options: twilio, textlocal, fast2sms, aws, mock

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# TextLocal Configuration (India)
TEXTLOCAL_API_KEY=your_api_key
TEXTLOCAL_SENDER=WINGO

# Fast2SMS Configuration (India)
FAST2SMS_API_KEY=your_api_key
FAST2SMS_SENDER=WINGO

# AWS SNS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## 🔒 Security Considerations

### Rate Limiting
- **OTP Requests**: 1 request per 2 minutes per mobile number
- **Failed Attempts**: Consider implementing progressive delays
- **IP-based limiting**: Add IP-based rate limiting for additional security

### Input Validation
- **Mobile Format**: Validates Indian (10-digit) and international formats
- **OTP Format**: Exactly 6 digits, numeric only
- **Password Strength**: Minimum 6 characters, alphanumeric required

### Token Security
- **OTP Generation**: Cryptographically secure random numbers
- **Storage**: Hashed storage recommended for production
- **Cleanup**: Automatic cleanup of expired tokens

## 🚀 Production Deployment

### 1. Database Migration
```bash
npx prisma migrate deploy
```

### 2. SMS Provider Setup
Choose and configure one of the supported SMS providers:

**For India (Recommended):**
- TextLocal or Fast2SMS for cost-effective local SMS
- Twilio for international reach

**For Global:**
- Twilio or AWS SNS for worldwide coverage

### 3. Environment Variables
Set all required environment variables in your production environment.

### 4. Testing
Use mock mode for development:
```env
SMS_PROVIDER=mock
NODE_ENV=development
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- **OTP Success Rate**: Percentage of successfully delivered OTPs
- **Reset Completion Rate**: Users who complete the full reset flow
- **Failed Attempts**: Monitor for potential abuse
- **Provider Performance**: SMS delivery times and success rates

### Logging
All password reset activities are logged with:
- Timestamp
- Mobile number (masked for privacy)
- Action performed
- Success/failure status
- Provider used

## 🔧 Maintenance

### Regular Cleanup
Implement a cron job to clean up expired password reset records:

```javascript
// Clean up expired records daily
setInterval(async () => {
  await prisma.passwordReset.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
}, 24 * 60 * 60 * 1000); // 24 hours
```

### Provider Monitoring
Monitor SMS provider performance and switch providers if needed:
- Track delivery rates
- Monitor response times
- Set up alerts for failures

## 🐛 Troubleshooting

### Common Issues

**OTP Not Received:**
1. Check mobile number format
2. Verify SMS provider configuration
3. Check provider account balance/limits
4. Review delivery logs

**Invalid OTP Error:**
1. Verify OTP hasn't expired (10 minutes)
2. Check if OTP was already used
3. Ensure correct mobile number

**Reset Token Issues:**
1. Verify token hasn't expired (15 minutes)
2. Check if token was generated after OTP verification
3. Ensure mobile number matches

### Error Codes
- `400`: Invalid input or expired token
- `404`: Mobile number not found
- `429`: Rate limit exceeded
- `500`: Server error or SMS delivery failure

## 🔄 Future Enhancements

### Planned Features
1. **Multi-language SMS**: Support for regional languages
2. **Voice OTP**: Fallback to voice calls for OTP delivery
3. **Biometric Reset**: Integration with device biometrics
4. **Admin Override**: Emergency password reset by administrators
5. **Audit Trail**: Comprehensive audit logging for compliance

### Security Improvements
1. **Device Fingerprinting**: Track device-specific resets
2. **Geolocation Validation**: Verify reset requests from known locations
3. **Machine Learning**: Detect suspicious reset patterns
4. **Multi-factor Authentication**: Additional verification layers
