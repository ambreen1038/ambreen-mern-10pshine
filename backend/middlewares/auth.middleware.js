const jwt = require('jsonwebtoken');
const models = require('../models');
const { logger } = require('../utils/logger');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('Missing or malformed auth header');
    return res.status(401).json({
      code: 'INVALID_AUTH_HEADER',
      message: 'Bearer token required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: process.env.JWT_EXPIRY_IN || process.env.JWT_EXPIRES_IN || '15m' // ensure env var name consistency
    });

    const user = await models.User.scope('withoutPassword').findByPk(payload.id, {
      attributes: { exclude: ['password', 'refreshToken'] },
    });

    if (!user) {
      logger.warn('Token valid but user not found', { userId: payload.id });
      return res.status(401).json({
        code: 'USER_NOT_FOUND',
        message: 'Account not available'
      });
    }

    // Set security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });

    req.user = user;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', {
      error: err.name,
      expiredAt: err.expiredAt
    });

    const response = {
      code: 'TOKEN_ERROR',
      message: 'Authentication failed'
    };

    if (err.name === 'TokenExpiredError') {
      response.code = 'TOKEN_EXPIRED';
      response.message = 'Session expired';
    }

    return res.status(401).json(response);
  }
}

module.exports = { verifyToken };
