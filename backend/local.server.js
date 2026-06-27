import dotenv from 'dotenv';
dotenv.config();


import app from './server.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 SentinelScan API running on http://localhost:${PORT}`);
    console.log(`📡 Inngest endpoint: http://localhost:${PORT}/api/inngest`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
};

start();