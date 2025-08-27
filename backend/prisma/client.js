import { createPrismaClient, checkDatabaseHealth } from '../utils/database.js';
import { logger } from '../utils/logger.js';

// Create optimized Prisma client with connection pooling
const prisma = createPrismaClient();

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    const health = await checkDatabaseHealth(prisma);
    
    if (health.healthy) {
      logger.info('Database connected successfully', { duration: health.duration });
    } else {
      logger.error('Database connection unhealthy', { error: health.error });
    }
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    throw error;
  }
};

// Graceful disconnect
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting database', { error: error.message });
  }
};

export { prisma, initializeDatabase, disconnectDatabase };
export * from '../utils/database.js';
