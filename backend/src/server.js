import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';

dotenv.config({ path: './.env' });

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
