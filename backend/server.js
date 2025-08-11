require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const { sequelize } = require('./models');
const { logger } = require('./utils/logger');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const CPU_COUNT = isProduction ? Math.min(os.cpus().length, 4) : 1; // Cap at 4 cores
const MAX_RESTARTS = parseInt(process.env.MAX_RESTARTS) || 5;

async function startServer() {
  try {
    // Database
    await sequelize.authenticate();
    await sequelize.sync({
      alter: isProduction && process.env.DB_ALTER === 'true',
      force: process.env.DB_FORCE === 'true'
    });
    logger.info('Database connected');

    // Server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (Worker ${process.pid})`);
    });

    // Timeout settings
    server.headersTimeout = 65000;
    server.keepAliveTimeout = 60000;

    const shutdown = async () => {
      logger.info(`Worker ${process.pid} shutting down...`);
      await sequelize.close();
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    logger.error('Startup failed:', err);
    process.exit(1);
  }
}

// Cluster mode
if (cluster.isPrimary && isProduction) {
  logger.info(`Master ${process.pid} starting ${CPU_COUNT} workers...`);
  
  let restarts = 0;
  const forkWorker = () => {
    const worker = cluster.fork();
    worker.on('exit', (code) => {
      if (restarts < MAX_RESTARTS) {
        restarts++;
        logger.warn(`Restarting worker (${restarts}/${MAX_RESTARTS})...`);
        forkWorker();
      } else {
        logger.error('Max restarts reached. Not restarting.');
        process.exit(1);
      }
    });
  };

  // Stagger worker starts
  for (let i = 0; i < CPU_COUNT; i++) {
    setTimeout(() => forkWorker(), i * 1000);
  }

} else {
  startServer();
 process.on('unhandledRejection', (reason, promise) => {
  // Log using console
  console.error('UNHANDLED REJECTION:', reason?.name || '', reason?.message || '');
  console.error(reason?.stack || reason);

  // Log using logger (if using Winston/Pino/etc.)
  logger?.error?.('UNHANDLED REJECTION:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason?.stack
  });

  // Optional: Exit
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1); // Optional for safety
});

}