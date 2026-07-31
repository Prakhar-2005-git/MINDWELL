import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';

dotenv.config({ path: './.env' });

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow tools without an Origin header (for example, health checks).
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbReady = await connectDB();
  if (!dbReady) {
    console.error('MongoDB is required for authentication. Server was not started.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required for authentication. Server was not started.');
    process.exit(1);
  }

  if (!process.env.MASTER_KEY || process.env.MASTER_KEY.length < 32) {
    console.error('MASTER_KEY (at least 32 characters) is required for journal encryption. Server was not started.');
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
