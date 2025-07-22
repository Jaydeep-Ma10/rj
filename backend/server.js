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
import manualDepositRoutes from './routes/manualDepositRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import manualWithdrawRoutes from './routes/manualWithdrawRoutes.js';
import wingoRoutes from './routes/wingoRoutes.js';
import { initRoundManagement } from './utils/roundManager.js';

// Initialize Prisma client
const prisma = new PrismaClient();

dotenv.config();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

/**
 * Initialize admin users if none exist
 */
async function initializeAdmins() {
  try {
    // Check if any admin exists
    const adminCount = await prisma.admin.count();
    
    if (adminCount === 0) {
      console.log('⚠️  No admin users found. Creating default admin...');
      
      // Get the absolute path to createAdmins.js
      const createAdminsPath = path.join(__dirname, 'scripts', 'createAdmins.js');
      
      // Run the admin creation script
      execSync(`node ${createAdminsPath}`, { 
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' }
      });
      
      console.log('✅ Admin initialization completed');
    } else {
      console.log(`✅ Found ${adminCount} admin user(s)`);
    }
  } catch (error) {
    console.error('❌ Error initializing admins:', error.message);
  }
}
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // or restrict to your frontend origin
    methods: ['GET', 'POST']
  }
});

// 📁 Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// ✅ Middleware
app.use(cors());

// 👇 Parses application/json for all routes
app.use(express.json());

// 👇 Parses urlencoded form data (important for multipart/form-data)
app.use(express.urlencoded({ extended: true }));

// 👇 Multer-based file route
app.use('/api', manualDepositRoutes);
app.use('/api', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', manualWithdrawRoutes);
app.use('/api/wingo', wingoRoutes);
app.use('/admin', adminAuthRoutes);
// 👇 Serves uploaded slips
app.use('/uploads', express.static('uploads'));

// Initialize admins first
await initializeAdmins();

// Then initialize round management system
const cleanupRoundManagement = initRoundManagement();

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  // Cleanup round management intervals
  cleanupRoundManagement();
  // Close the HTTP server
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

// ✅ Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running with Socket.io on http://localhost:${PORT}`);
    console.log('Round management system initialized');
});
