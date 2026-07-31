import app from '../backend/src/app.js';
import connectDB from '../backend/src/config/db.js';

let databaseReady;

const requiredEnvironment = ['MONGO_URI', 'JWT_SECRET', 'MASTER_KEY'];

const connectOnce = async () => {
  if (!databaseReady) {
    databaseReady = connectDB().then((connected) => {
      if (!connected) throw new Error('Database connection failed.');
      return true;
    });
  }

  return databaseReady;
};

// Vercel invokes this function for every /api/* request. The cached promise
// reuses the MongoDB connection while a serverless instance stays warm.
export default async function handler(req, res) {
  const missing = requiredEnvironment.filter((key) => !process.env[key]);
  if (missing.length > 0 || process.env.MASTER_KEY.length < 32) {
    return res.status(500).json({ message: 'Server configuration is incomplete.' });
  }

  try {
    await connectOnce();
    return app(req, res);
  } catch (error) {
    console.error('Unable to initialize API:', error);
    databaseReady = undefined;
    return res.status(503).json({ message: 'Service is temporarily unavailable.' });
  }
}
