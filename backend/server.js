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
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { isUsingS3 } from './services/s3TransactionSlipService.js';

// Load environment variables first
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 10000; // Use Render/Heroku port or 10000 for local

// --- CORS Configuration ---
const corsOptions = {
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Initialize Express and HTTP server
const app = express();
app.use(cors(corsOptions)); // <--- CORS applied before anything else
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
    console.log('🔍 Skipping migrations - using db push for development');
    // Temporarily disabled for development - using db push instead
    // execSync('npx prisma migrate deploy', { 
    //   stdio: 'inherit',
    //   env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' }
    // });
    console.log('✅ Database schema is already in sync');
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
    
    // 5. Initialize keep-alive for Render free tier
    const { initKeepAlive } = await import('./utils/keepAlive.js');
    initKeepAlive();
    
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
    // httpServer.listen(PORT, ...) REMOVED from here to avoid double listen error.
    console.log('Round management system initialized');

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
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
    { path: '/admin', module: './routes/adminAuthRoutes.js' }
  ];

  // Load routes sequentially to ensure proper loading
  for (const route of routes) {
    try {
      const module = await import(route.module);
      const router = module.default;
      app.use(route.path, router);
      console.log(`✅ Loaded route: ${route.module} at ${route.path}`);
    } catch (error) {
      console.error(`❌ Failed to load route ${route.module}:`, error);
    }
  }

  // Static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  console.log('✅ All routes loaded successfully');
}

// Configure middleware
function configureMiddleware() {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Route to serve the password reset test page
  app.get('/password-reset-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'password-reset-test.html'));
  });
  
  // Route to serve the file upload test page
  app.get('/file-upload-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'file-upload-test.html'));
  });
}

// Start the application
async function startApp() {
  configureMiddleware();
  await setupRoutes();
  await initializeApp();
}

startApp();

// Only call listen ONCE, here:
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.io on http://localhost:${PORT}`);
  console.log(`📄 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`📱 Mobile app API available at http://localhost:${PORT}/api`);
  console.log(`📦 S3 Storage: ${isUsingS3() ? '✅ Configured' : '⚠️ Not Configured (using local storage)'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});