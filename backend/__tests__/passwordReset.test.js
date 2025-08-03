import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../app';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Mock the logger to prevent test logs from cluttering the console
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock the SMS service
jest.mock('../utils/smsService', () => ({
  sendOTPSMS: jest.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  validateMobileNumber: jest.fn().mockReturnValue({ valid: true })
}));

describe('Password Reset Flow', () => {
  let testUser;
  let testResetToken;
  const testMobile = '+1234567890';
  const testOtp = '123456';
  const newPassword = 'NewSecurePass123!';

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        mobile: testMobile,
        name: 'Test User',
        password: await bcrypt.hash('OldPassword123!', 10),
        isActive: true
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.passwordReset.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Request OTP', () => {
    it('should return 400 for invalid mobile number', async () => {
      const response = await request(app)
        .post('/api/password-reset/request-otp')
        .send({ mobile: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid mobile number');
    });

    it('should return 404 for non-existent mobile number', async () => {
      const response = await request(app)
        .post('/api/password-reset/request-otp')
        .send({ mobile: '+1987654321' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should generate and send OTP for valid mobile number', async () => {
      const response = await request(app)
        .post('/api/password-reset/request-otp')
        .send({ mobile: testMobile });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP has been sent');
      expect(logger.info).toHaveBeenCalledWith('OTP generated successfully', expect.any(Object));
    });

    it('should prevent multiple OTP requests within rate limit window', async () => {
      // First request
      await request(app)
        .post('/api/password-reset/request-otp')
        .send({ mobile: testMobile });

      // Second request within rate limit window
      const response = await request(app)
        .post('/api/password-reset/request-otp')
        .send({ mobile: testMobile });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Please wait');
    });
  });

  describe('Verify OTP', () => {
    beforeEach(async () => {
      // Create a test OTP
      const hashedOtp = await bcrypt.hash(testOtp, 10);
      await prisma.passwordReset.create({
        data: {
          mobile: testMobile,
          otp: hashedOtp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
          userId: testUser.id,
          requestIp: '::ffff:127.0.0.1',
          userAgent: 'test-agent',
          metadata: {}
        }
      });
    });

    it('should return 400 for invalid OTP', async () => {
      const response = await request(app)
        .post('/api/password-reset/verify-otp')
        .send({
          mobile: testMobile,
          otp: '000000' // Invalid OTP
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid OTP');
    });

    it('should verify valid OTP and return reset token', async () => {
      const response = await request(app)
        .post('/api/password-reset/verify-otp')
        .send({
          mobile: testMobile,
          otp: testOtp
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.resetToken).toBeDefined();
      expect(response.body.expiresIn).toBeDefined();
      
      // Save the reset token for the next test
      testResetToken = response.body.resetToken;
    });
  });

  describe('Reset Password', () => {
    beforeEach(async () => {
      // Create a reset token
      const hashedToken = await bcrypt.hash('test-reset-token', 10);
      await prisma.passwordReset.create({
        data: {
          mobile: testMobile,
          otp: hashedToken,
          isUsed: false,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          userId: testUser.id,
          requestIp: '::ffff:127.0.0.1',
          userAgent: 'test-agent',
          metadata: {
            type: 'password_reset_token'
          }
        }
      });
    });

    it('should return 400 for invalid reset token', async () => {
      const response = await request(app)
        .post('/api/password-reset/reset-password')
        .send({
          resetToken: 'invalid-token',
          newPassword: newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid or expired');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/password-reset/reset-password')
        .send({
          resetToken: 'test-reset-token',
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should successfully reset password with valid token and strong password', async () => {
      const response = await request(app)
        .post('/api/password-reset/reset-password')
        .send({
          resetToken: 'test-reset-token',
          newPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password has been reset');
      
      // Verify password was actually updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      
      const isPasswordUpdated = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isPasswordUpdated).toBe(true);
      expect(updatedUser.lastPasswordChange).not.toBeNull();
      
      // Verify the reset token was marked as used
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { otp: { contains: 'test-reset-token' } }
      });
      expect(resetRecord.isUsed).toBe(true);
    });
  });
});
