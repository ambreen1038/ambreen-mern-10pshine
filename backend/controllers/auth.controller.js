const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { registerUser, loginUser } = require('../services/auth.service');
const { User } = require('../models');
const { logger } = require('../utils/logger');
const emailService = require('../services/email.service');
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY_IN || '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateToken(userId, type = 'access') {
  const secret = type === 'access'
    ? process.env.JWT_SECRET
    : process.env.JWT_REFRESH_SECRET;

  const expiresIn = type === 'access'
    ? ACCESS_TOKEN_EXPIRY
    : REFRESH_TOKEN_EXPIRY;

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

const authController = {
  getMe: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        });
      }
      res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      });
    } catch (error) {
      console.error('GetMe Error:', error);
      res.status(500).json({
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    }
  },

  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const user = await registerUser({ name, email, password });
      const accessToken = generateToken(user.id, 'access');
      const refreshToken = generateToken(user.id, 'refresh');

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: accessToken,
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Email already registered' });
      }
      if (err.name === 'WeakPasswordError') {
        return res.status(400).json({ message: err.message });
      }
      logger.error('Registration failed', { error: err.message });
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const { user, token: accessToken, refreshToken } = await loginUser({ email, password });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: accessToken,
      });
    } catch (err) {
      logger.warn('Login failed', { error: err.message });
      res.status(401).json({ message: err.message || 'Invalid credentials' });
    }
  },

  refreshToken: (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      const accessToken = generateToken(decoded.id, 'access');
      res.json({ token: accessToken });
    });
  },

  logout: (req, res) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  },

  forgotPassword: async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(200).json({ message: 'If email exists, reset link sent' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      user.resetToken = hashedToken;
      user.resetTokenExpiry = Date.now() + 3600000;
      await user.save();

      await emailService.sendPasswordReset(user.email, token);

      res.json({ message: 'Reset link sent' });
    } catch (err) {
      logger.error('Forgot password error', { error: err.message });
      res.status(500).json({ message: 'Error sending reset email' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const rawToken = req.params.token || req.body.token;
      if (!rawToken) {
        return res.status(400).json({ message: 'Reset token is missing' });
      }

      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      const user = await User.findOne({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: { [Op.gt]: Date.now() },
        },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);

      user.passwordHash = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ message: 'Error resetting password' });
    }
  },

  // NEW: Change Password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required' });
      }

      const user = await User.scope('withPassword').findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 12;
      user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ message: 'Error changing password' });
    }
  }
};

module.exports = authController;
