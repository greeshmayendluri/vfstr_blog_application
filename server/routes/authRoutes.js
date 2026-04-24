const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a student
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login a student
// @access  Public
router.post('/login', authController.login);

// @route   PUT api/auth/update-password
// @desc    Update user password
// @access  Private
router.put('/update-password', auth, authController.updatePassword);

// @route   POST api/auth/reset-password
// @desc    Reset user password (unauthenticated flow)
// @access  Public
router.post('/reset-password', authController.resetPassword);

module.exports = router;
