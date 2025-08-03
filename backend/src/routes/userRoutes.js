const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  googleAuth,
  googleAuthFailure
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../utils/validation');

// Public routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  googleAuth
);
router.get('/google/failure', googleAuthFailure);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.put('/change-password', authenticateToken, changePassword);

// Admin routes
router.get('/all', authenticateToken, requireAdmin, getAllUsers);

module.exports = router;