import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

// Force Node.js to use Google DNS for MongoDB Atlas SRV lookups.
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables.
dotenv.config();

const port = process.env.PORT || 5000;

// Connect to MongoDB.
await connectDatabase();

// Create Express application.
const app = createApp();

// Start the HTTP server and retain its reference for graceful shutdown.
const server = app.listen(port, () => {
  console.log(`JAIMS API listening on port ${port}`);
});

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down JPMP API...`);

  server.close(async (error) => {
    if (error) {
      console.error('HTTP server shutdown failed:', error);
      process.exit(1);
    }

    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (databaseError) {
      console.error('MongoDB shutdown failed:', databaseError);
      process.exit(1);
    }
  });

  // Prevent the process from remaining alive indefinitely.
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGUSR2', () => {
  void shutdown('SIGUSR2');
});

server.on('error', (error) => {
  console.error('HTTP server error:', error);
  process.exit(1);
});