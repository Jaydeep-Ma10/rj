// server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import fs from 'fs';
import { execSync } from 'child_process';
import { prisma, initializeDatabase, disconnectDatabase } from './prisma/client.js';
import { isUsingS3 } from './services/s3TransactionSlipService.js';
import { logger } from './utils/logger.js';
import { securityHeaders, apiRateLimit, sanitizeInput } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestMonitoring, securityMonitoring, performanceMetrics, getMetrics } from './middleware/monitoring.js';

// Load environment variables first
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 10000; // Use Render/Heroku port or 10000 for local

// --- CORS Configuration ---
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://rj-755j.onrender.com',
    'https://resonant-youtiao-a8061f.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Initialize Express and HTTP server
const app = express();

// APPLY SECURITY MIDDLEWARE FIRST
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(apiRateLimit);

// Add body parser middleware for JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Monitoring middleware
app.use(requestMonitoring);
app.use(securityMonitoring);
app.use(performanceMetrics);

// CORS preflight handler
app.options('*', cors(corsOptions));


const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://rj-755j.onrender.com',
      'https://resonant-youtiao-a8061f.netlify.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/', 
  transports: ['websocket', 'polling'],
  allowEIO3: true, 
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: false
});

// Make io globally available for round manager
global.io = io;

// Ensure uploads directory exists
function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Initialize optimized database connection
async function testDatabaseConnection() {
  try {
    await initializeDatabase();
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// Initialize admin users
async function initializeAdmins() {
  try {
    const { initializeAdminUsers } = await import('./services/adminUserService.js');
    
    const adminCount = await prisma.admin.count();
    
    if (adminCount === 0) {
      logger.warn('No admin users found. Initializing from environment config...');
      const result = await initializeAdminUsers();
      logger.info(`Admin initialization completed: ${result.created} created, ${result.existing} existing`);
    } else {
      logger.info(`Found ${adminCount} admin user(s)`);
      // Still run initialization to create any missing admins from env config
      const result = await initializeAdminUsers();
      if (result.created > 0) {
        logger.info(`Added ${result.created} new admin users from environment config`);
      }
    }
  } catch (error) {
    logger.error('Error initializing admins:', error.message);
    throw error;
  }
}

// Initialize demo users for promotion
async function initializeDemoUsers() {
  try {
    const { demoUserService } = await import('./services/demoUserService.js');
    await demoUserService.initializeDemoUsers();
  } catch (error) {
    logger.error('Error initializing demo users:', error.message);
  }
}

// Initialize test user for development
async function initializeTestUser() {
  try {
    logger.info('Checking for test user...');
    
    const testUser = await prisma.user.findUnique({
      where: { mobile: '9876543210' }
    });
    
    if (!testUser) {
      logger.warn('Test user not found. Creating test user...');
      const createTestUserPath = path.join(__dirname, 'scripts', 'createTestUser.js');
      
      execSync(`node ${createTestUserPath}`, { 
        stdio: 'inherit',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--experimental-vm-modules'
        },
        cwd: __dirname
      });
      
      logger.info('Test user initialization completed');
    } else {
      logger.info(`Found test user: ${testUser.name} (Balance: ${testUser.balance})`);
    }
  } catch (error) {
    logger.error('Error initializing test user:', error.message);
    // Don't throw error - test user is optional for production
  }
}

// Initialize application
async function initializeApp() {
  try {
    // 1. Ensure required directories exist
    ensureUploadsDir();
    
    // 2. Test database connection (migrations handled by package.json build script)
    await testDatabaseConnection();
    
    // 3. Initialize admin users
    await initializeAdmins();
    
    // 4. Initialize demo users for promotion
    await initializeDemoUsers();
    
    // 5. Initialize test user for development
    await initializeTestUser();
    
    // 6. Initialize round management
    const { initRoundManagement } = await import('./utils/roundManager.js');
    const cleanupRoundManagement = initRoundManagement();
    
    // 7. Initialize keep-alive for Render free tier
    const { initKeepAlive } = await import('./utils/keepAlive.js');
    initKeepAlive();
    
    // 8. Set up graceful shutdown
    const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    shutdownSignals.forEach(signal => {
      process.on(signal, () => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        cleanupRoundManagement?.();
        httpServer.close(() => {
          logger.info('Server closed');
          process.exit(0);
        });
      });
    });

    logger.info('Application initialized successfully');

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Import routes
async function setupRoutes() {
  // Import routes dynamically
  const routes = [
    { path: '/api', module: './routes/healthRoutes.js' },
    { path: '/api', module: './routes/manualDepositRoutes.js' },
    { path: '/api', module: './routes/adminRoutes.js' },
    { path: '/api', module: './routes/userRoutes.js' },
    { path: '/api', module: './routes/authRoutes.js' },
    { path: '/api/password-reset', module: './routes/passwordResetRoutes.js' },
    { path: '/api', module: './routes/manualWithdrawRoutes.js' },
    { path: '/api/wingo', module: './routes/wingoRoutes.js' },
    { path: '/api/files', module: './routes/fileUpload.js' },
    { path: '/admin', module: './routes/adminAuthRoutes.js' },
    { path: '/api/demo', module: './routes/demoRoutes.js' },
    { path: '/api/admin-management', module: './routes/adminManagementRoutes.js' }
  ];

  // Load routes sequentially to ensure proper loading
  for (const route of routes) {
    try {
      logger.debug(`Attempting to load route: ${route.module} at ${route.path}`);
      const module = await import(route.module);
      const router = module.default;
      
      // Log the router's stack to see what routes are registered
      logger.debug(`Router for ${route.module} has ${router.stack?.length || 0} routes`);
      if (router.stack) {
        router.stack.forEach(layer => {
          logger.debug(`  - ${layer.route?.path} (${Object.keys(layer.route?.methods || {}).filter(m => layer.route?.methods[m])})`);
        });
      }
      
      app.use(route.path, router);
      logger.info(`Loaded route: ${route.module} at ${route.path}`);
    } catch (error) {
      logger.error(`Failed to load route ${route.module}:`, error);
    }
  }

  // Static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  logger.info('All routes loaded successfully');
}

// Configure middleware
function configureMiddleware() {
  // CORS is already applied above, don't apply it again
  // Static files and other middleware only
  app.use(express.static(path.join(__dirname, 'public')));
}

// Start the application
async function startApp() {
  configureMiddleware();
  await setupRoutes();
  
  // Add error handling middleware AFTER routes
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  await initializeApp();
}

startApp();

// Add graceful shutdown handlers
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  try {
    await disconnectDatabase();
  } catch (error) {
    logger.error('Error during database disconnection:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbDuration = Date.now() - dbStart;
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        responseTime: `${dbDuration}ms`
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      error: 'Service unavailable',
      database: {
        status: 'disconnected'
      }
    });
  }
});

// Metrics endpoint (protected)
app.get('/metrics', (req, res) => {
  // Simple auth check - in production, use proper admin auth
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.METRICS_TOKEN || 'metrics-secret'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json(getMetrics());
});

// Only call listen ONCE, here:
httpServer.listen(PORT, () => {
  logger.info(`Server running with Socket.io on http://localhost:${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`Mobile app API available at http://localhost:${PORT}/api`);
  logger.info(`S3 Storage: ${isUsingS3() ? 'Configured' : 'Not Configured (using local storage)'}`);
});