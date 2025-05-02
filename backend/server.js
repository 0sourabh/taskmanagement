// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Import the socket utility
import { initSocket } from './utils/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // Create server using http
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Initialize Socket.IO
initSocket(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
