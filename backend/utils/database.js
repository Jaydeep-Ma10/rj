import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Database configuration for production optimization
const databaseConfig = {
  // Connection pool settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Logging configuration
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  // Error formatting
  errorFormat: 'pretty',
};

// Create optimized Prisma client with connection pooling
export const createPrismaClient = () => {
  const prisma = new PrismaClient(databaseConfig);

  // Log slow queries in production
  prisma.$on('query', (e) => {
    if (e.duration > 1000) { // Log queries taking more than 1 second
      logger.warn('Slow database query detected', {
        query: e.query,
        duration: `${e.duration}ms`,
        params: e.params
      });
    }
  });

  // Log database errors
  prisma.$on('error', (e) => {
    logger.error('Database error', {
      message: e.message,
      target: e.target
    });
  });

  // Log database info
  prisma.$on('info', (e) => {
    logger.info('Database info', { message: e.message });
  });

  // Log database warnings
  prisma.$on('warn', (e) => {
    logger.warn('Database warning', { message: e.message });
  });

  return prisma;
};

// Database health check
export const checkDatabaseHealth = async (prisma) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    logger.info('Database health check passed', { duration: `${duration}ms` });
    return { healthy: true, duration };
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return { healthy: false, error: error.message };
  }
};

// Optimized query helpers
export const withPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: Math.min(limit, 100) // Cap at 100 items per page
  };
};

// Transaction wrapper with retry logic
export const withTransaction = async (prisma, operations, maxRetries = 3) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await prisma.$transaction(operations);
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        logger.error('Transaction failed after retries', {
          error: error.message,
          attempts: attempt
        });
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      logger.warn('Transaction retry', {
        attempt,
        error: error.message,
        nextRetryIn: `${delay * 2}ms`
      });
    }
  }
};

// Common query optimizations
export const optimizedQueries = {
  // Get user with minimal data
  getUserBasic: (prisma, userId) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        mobile: true,
        balance: true,
        createdAt: true
      }
    });
  },

  // Get recent bets with pagination
  getRecentBets: (prisma, userId, page = 1, limit = 20) => {
    const { skip, take } = withPagination(page, limit);
    
    return prisma.wingoBet.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        type: true,
        value: true,
        won: true,
        payout: true,
        createdAt: true,
        round: {
          select: {
            id: true,
            period: true,
            result: true,
            interval: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });
  },

  // Get game history with minimal data
  getGameHistory: (prisma, interval, page = 1, limit = 50) => {
    const { skip, take } = withPagination(page, limit);
    
    return prisma.wingoRound.findMany({
      where: { 
        interval,
        result: { not: null }
      },
      select: {
        id: true,
        period: true,
        result: true,
        createdAt: true,
        interval: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });
  }
};
