// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import manualDepositRoutes from './routes/manualDepositRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import manualWithdrawRoutes from './routes/manualWithdrawRoutes.js';
import wingoRoutes from './routes/wingoRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
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

// ✅ Start server
httpServer.listen(5000, () => {
    console.log('🚀 Server running with Socket.io on http://localhost:5000');
});
