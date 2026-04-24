const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   PUT api/users/follow/:id
// @desc    Toggle follow/unfollow a user
// @access  Private
router.put('/follow/:id', auth, userController.toggleFollow);

// @route   GET api/users/following
// @desc    Get current user's following list
// @access  Private
router.get('/following', auth, userController.getFollowing);

// @route   GET api/users/:id
// @desc    Get a user's public profile
// @access  Public
router.get('/:id', userController.getUserProfile);

module.exports = router;
