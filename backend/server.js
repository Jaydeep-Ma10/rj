// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

// Initialize Express and HTTP server
const app = express();
const httpServer = createServer(app);

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Socket.IO
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://rj-755j.onrender.com'
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

// Ensure uploads directory exists
function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Apply database migrations
async function applyMigrations() {
  try {
    console.log('🔍 Checking for pending migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' }
    });
    console.log('✅ Database migrations applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply migrations:', error);
    throw error;
  }
}

// Initialize admin users
async function initializeAdmins() {
  try {
    const adminCount = await prisma.admin.count();
    
    if (adminCount === 0) {
      console.log('⚠️  No admin users found. Creating default admin...');
      const createAdminsPath = path.join(__dirname, 'scripts', 'createAdmins.js');
      
      execSync(`node ${createAdminsPath}`, { 
        stdio: 'inherit',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--experimental-vm-modules'
        },
        cwd: __dirname
      });
      
      console.log('✅ Admin initialization completed');
    } else {
      console.log(`✅ Found ${adminCount} admin user(s)`);
    }
  } catch (error) {
    console.error('❌ Error initializing admins:', error.message);
    throw error;
  }
}

// Initialize application
async function initializeApp() {
  try {
    // 1. Ensure required directories exist
    ensureUploadsDir();
    
    // 2. Apply database migrations
    await applyMigrations();
    
    // 3. Initialize admin users
    await initializeAdmins();
    
    // 4. Initialize round management
    const { initRoundManagement } = await import('./utils/roundManager.js');
    const cleanupRoundManagement = initRoundManagement();
    
    // 5. Set up graceful shutdown
    const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    shutdownSignals.forEach(signal => {
      process.on(signal, () => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        cleanupRoundManagement?.();
        httpServer.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
    });

    // 6. Start the server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running with Socket.io on http://localhost:${PORT}`);
      console.log('Round management system initialized');
    });

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Import routes
function setupRoutes() {
  // Import routes dynamically
  const routes = [
    { path: '/api', module: './routes/manualDepositRoutes.js' },
    { path: '/api', module: './routes/adminRoutes.js' },
    { path: '/api', module: './routes/userRoutes.js' },
    { path: '/api', module: './routes/authRoutes.js' },
    { path: '/api', module: './routes/manualWithdrawRoutes.js' },
    { path: '/api/wingo', module: './routes/wingoRoutes.js' },
    { path: '/admin', module: './routes/adminAuthRoutes.js' }
  ];

  routes.forEach(async (route) => {
    try {
      const { default: router } = await import(route.module);
      app.use(route.path, router);
    } catch (error) {
      console.error(`❌ Failed to load route ${route.module}:`, error);
    }
  });

  // Static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Configure middleware
function configureMiddleware() {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

// Start the application
configureMiddleware();
setupRoutes();
initializeApp();