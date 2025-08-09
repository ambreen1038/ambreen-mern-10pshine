const { User } = require("../models");
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middlewares/validate.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

// =========================
// Auth Routes
// =========================

// Get current user
router.get('/me', verifyToken, authController.getMe);

// Register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  ],
  validationMiddleware,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validationMiddleware,
  authController.login
);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Forgot Password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validationMiddleware,
  authController.forgotPassword
);

// Reset Password
router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  ],
  validationMiddleware,
  authController.resetPassword
);

// Change Password (NEW)
router.patch(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
  ],
  validationMiddleware,
  authController.changePassword
);

module.exports = router;
