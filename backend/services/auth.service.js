const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logger } = require('../utils/logger');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 12;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY_IN || '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateToken(userId, type = 'access') {
  return jwt.sign(
    { id: userId },
    type === 'access' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: type === 'access' ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    }
  );
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
    const err = new Error('Password must contain uppercase, lowercase, number, and special character');
    err.name = 'WeakPasswordError';
    throw err;
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hash,
  });

  logger.info('USER_REGISTERED', { userId: user.id });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token: generateToken(user.id, 'access'),
    refreshToken: generateToken(user.id, 'refresh'),
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.scope('withPassword').findOne({
      where: {
        email: normalizedEmail,
        deletedAt: null,
      },
      attributes: ['id', 'name', 'email', 'passwordHash'],
    });

    if (!user) {
      logger.warn('LOGIN_FAILED_USER_NOT_FOUND', { email: normalizedEmail });
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      logger.warn('LOGIN_FAILED_PASSWORD_MISMATCH', { userId: user.id });
      throw new Error('Invalid credentials');
    }

    User.update(
      { lastLoginAt: new Date() },
      { where: { id: user.id } }
    ).catch(err => logger.error('LOGIN_TIME_UPDATE_FAILED', err));

    logger.info('USER_LOGGED_IN', { userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user.id, 'access'),
      refreshToken: generateToken(user.id, 'refresh'),
    };
  } catch (error) {
    logger.error('LOGIN_FAILED', {
      email: normalizedEmail,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    throw error;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ where: { id: payload.id, deletedAt: null } });

    if (!user) {
      throw new Error('User not found');
    }

    const token = generateToken(user.id, 'access');
    return { token };
  } catch (error) {
    logger.warn('REFRESH_TOKEN_INVALID_OR_EXPIRED', {
      token: refreshToken,
      error: error.message,
    });
    throw new Error('Invalid refresh token');
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
};
