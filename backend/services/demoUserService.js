// services/demoUserService.js
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client.js';

/**
 * Demo User Service - Creates and manages promotional users that always win
 */
class DemoUserService {
  constructor() {
    this.demoUsers = new Set();
    this.initialized = false;
  }

  /**
   * Initialize demo users on server startup
   */
  async initializeDemoUsers() {
    if (!process.env.DEMO_USERS_ENABLED || process.env.DEMO_USERS_ENABLED !== 'true') {
      console.log('Demo users disabled');
      return;
    }

    try {
      const phones = process.env.DEMO_USER_PHONES?.split(',') || [];
      const names = process.env.DEMO_USER_NAMES?.split(',') || [];
      const password = process.env.DEMO_USER_PASSWORD || '584288@Rj';
      const initialBalance = parseInt(process.env.DEMO_USER_INITIAL_BALANCE) || 10000;

      if (phones.length !== names.length) {
        console.error('Demo user phones and names count mismatch');
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      for (let i = 0; i < phones.length; i++) {
        const phone = phones[i].trim();
        const name = names[i].trim();

        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { mobile: phone }
          });

          if (!existingUser) {
            // Generate unique referral code
            const referralCode = `DEMO${String(i + 1).padStart(3, '0')}`;
            
            // Create new demo user
            const demoUser = await prisma.user.create({
              data: {
                mobile: phone,
                name,
                password: hashedPassword,
                balance: initialBalance,
                referralCode,
                isDemoUser: true
              }
            });

            this.demoUsers.add(demoUser.id);
            console.log(`Created demo user: ${name} (${phone})`);
          } else {
            // Add existing user to demo list
            this.demoUsers.add(existingUser.id);
            
            // Update existing user to be demo user
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                isDemoUser: true,
                balance: Math.max(existingUser.balance, initialBalance) // Ensure minimum balance
              }
            });
            
            console.log(`Updated existing user to demo: ${name} (${phone})`);
          }
        } catch (userError) {
          console.error(`Error processing demo user ${phone}:`, userError.message);
          // Continue with next user instead of failing completely
        }
      }

      this.initialized = true;
      console.log(`Initialized ${this.demoUsers.size} demo users`);

    } catch (error) {
      console.error('Error initializing demo users:', error);
    }
  }

  /**
   * Check if a user is a demo user
   */
  isDemoUser(userId) {
    return this.demoUsers.has(userId);
  }

  /**
   * Get all demo user IDs
   */
  getDemoUserIds() {
    return Array.from(this.demoUsers);
  }

  /**
   * Add user to demo list (for runtime additions)
   */
  addDemoUser(userId) {
    this.demoUsers.add(userId);
  }

  /**
   * Remove user from demo list
   */
  removeDemoUser(userId) {
    this.demoUsers.delete(userId);
  }

  /**
   * Get demo users count
   */
  getDemoUsersCount() {
    return this.demoUsers.size;
  }

  /**
   * Refresh demo users from database
   */
  async refreshDemoUsers() {
    try {
      const demoUsers = await prisma.user.findMany({
        where: { isDemoUser: true },
        select: { id: true }
      });

      this.demoUsers.clear();
      demoUsers.forEach(user => this.demoUsers.add(user.id));
      
      console.log(`Refreshed ${this.demoUsers.size} demo users from database`);
    } catch (error) {
      console.error('Error refreshing demo users:', error);
    }
  }
}

// Export singleton instance
export const demoUserService = new DemoUserService();
