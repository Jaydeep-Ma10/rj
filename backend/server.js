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
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://rj-755j.onrender.com',
    'https://resonant-youtiao-a8061f.netlify.app',
    '*' // Allow all origins for testing
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Initialize Express and HTTP server
const app = express();

// APPLY CORS FIRST - BEFORE ANY ROUTES OR MIDDLEWARE
app.use(cors(corsOptions));

// Add body parser middleware for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS preflight handler
app.options('*', cors(corsOptions));

// Debug route to check CORS
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  });
});

// Add test routes AFTER CORS middleware
app.get('/api/test', (req, res) => {
  console.log('GET test route hit!');
  res.json({ success: true, message: 'GET test route works!', method: 'GET' });
});

app.post('/api/test-post', (req, res) => {
  console.log('POST test route hit!', { 
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  res.json({ 
    success: true, 
    message: 'POST test route works!',
    method: 'POST',
    body: req.body,
    headers: req.headers
  });
});

// Direct test route for manual deposit
app.post('/api/test-manual-deposit', (req, res) => {
  console.log('Direct test manual deposit route hit!', { 
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  
  // Simulate the manual deposit controller
  res.json({ 
    success: true, 
    message: 'Direct test manual deposit route works!',
    method: 'POST',
    body: req.body
  });
});

// Direct manual deposit route for testing
app.post('/api/direct-manual-deposit', (req, res) => {
  console.log('Direct manual deposit route hit!', { 
    headers: req.headers,
    body: req.body
  });
  
  // Simple validation
  if (!req.body.name || !req.body.amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name and amount are required',
      received: req.body
    });
  }
  
  // Return success response
  res.json({ 
    success: true, 
    message: 'Manual deposit received',
    data: {
      name: req.body.name,
      amount: req.body.amount,
      utr: req.body.utr || 'TEST-UTR-123',
      method: req.body.method || 'TEST',
      timestamp: new Date().toISOString()
    }
  });
});

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

// Test database connection (no migration handling)
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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

// Initialize test user for development
async function initializeTestUser() {
  try {
    console.log('🧪 Checking for test user...');
    
    const testUser = await prisma.user.findUnique({
      where: { name: 'TestUser' }
    });
    
    if (!testUser) {
      console.log('⚠️  Test user not found. Creating test user...');
      const createTestUserPath = path.join(__dirname, 'scripts', 'createTestUser.js');
      
      execSync(`node ${createTestUserPath}`, { 
        stdio: 'inherit',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--experimental-vm-modules'
        },
        cwd: __dirname
      });
      
      console.log('✅ Test user initialization completed');
    } else {
      console.log(`✅ Found test user: ${testUser.name} (Balance: ${testUser.balance})`);
    }
  } catch (error) {
    console.error('❌ Error initializing test user:', error.message);
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
    
    // 4. Initialize test user for development
    await initializeTestUser();
    
    // 5. Initialize round management
    const { initRoundManagement } = await import('./utils/roundManager.js');
    const cleanupRoundManagement = initRoundManagement();
    
    // 6. Initialize keep-alive for Render free tier
    const { initKeepAlive } = await import('./utils/keepAlive.js');
    initKeepAlive();
    
    // 7. Set up graceful shutdown
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

    console.log('✅ Application initialized successfully');

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
    { path: '/api', module: './routes/wingoRoutes.js' },
    { path: '/api/files', module: './routes/fileUpload.js' },
    { path: '/admin', module: './routes/adminAuthRoutes.js' }
  ];

  // Load routes sequentially to ensure proper loading
  for (const route of routes) {
    try {
      console.log(`🔍 Attempting to load route: ${route.module} at ${route.path}`);
      const module = await import(route.module);
      const router = module.default;
      
      // Log the router's stack to see what routes are registered
      console.log(`📋 Router for ${route.module} has ${router.stack?.length || 0} routes`);
      if (router.stack) {
        router.stack.forEach(layer => {
          console.log(`  - ${layer.route?.path} (${Object.keys(layer.route?.methods || {}).filter(m => layer.route?.methods[m])})`);
        });
      }
      
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
  // CORS is already applied above, don't apply it again
  // Static files and other middleware only
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