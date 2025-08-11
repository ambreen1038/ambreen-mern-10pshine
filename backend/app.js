const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression'); // Added
const cookieParser = require('cookie-parser'); //  Added
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { logger, httpLogger } = require('./utils/logger');
const errorHandler = require('./middlewares/error.middleware');
const loadRoutes = require('./utils/route-loader');
const app = express();

//  Critical error handling (must be first)
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
});

// Request tracking
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.set('X-Request-ID', req.id);
  next();
});

// Environment Validation
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length) {
  logger.fatal(`Missing ENV vars: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Security Middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // ✅ Added
app.use(compression());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests',
  keyGenerator: (req) => req.id,
  standardHeaders: true
});

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['X-Request-ID']
}));

// Logging
app.use(httpLogger);

// 🔥 Route loading with basic validation
try {
  console.log('[ROUTER] Loading routes...');

  const authRoutes = loadRoutes('./routes/auth.routes');
  if (!authRoutes || typeof authRoutes !== 'function') {
    throw new Error('Invalid auth routes - must be an Express router');
  }

  const notesRoutes = require('./routes/notes.routes');
  if (!notesRoutes || typeof notesRoutes !== 'function') {
    throw new Error('Invalid notes routes - must be an Express router');
  }
  app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


  console.log('[ROUTER] Routes loaded successfully');

  app.use('/api/auth', apiLimiter, authRoutes);
  app.use('/api/notes', apiLimiter, notesRoutes);

} catch (err) {
  logger.fatal('ROUTE LOADING FAILED:', err);
  console.error('[FATAL] ROUTE LOADING FAILED:', err);
  process.exit(1);
}

// Health check
app.use('/health', (req, res) => res.json({
  status: 'ok',
  requestId: req.id
}));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Route ${req.path} not found`,
    requestId: req.id
  });
});

// Error Handling
app.use(errorHandler);

module.exports = app;
