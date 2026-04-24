const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, postController.createPost);

// @route   GET api/posts/me
// @desc    Get all posts created by the logged-in user
// @access  Private
router.get('/me', auth, postController.getMyPosts);

// @route   GET api/posts/user/:userId
// @desc    Get all posts created by a specific user
// @access  Public
router.get('/user/:userId', postController.getUserPosts);

// @route   GET api/posts
// @desc    Get all posts (Segmented by user branch via auth token)
// @access  Private
router.get('/', auth, postController.getPosts);

// @route   PUT api/posts/like/:id
// @desc    Like or Unlike a post
// @access  Private
router.put('/like/:id', auth, postController.toggleLike);

// @route   POST api/posts/comment/:id
// @desc    Add a comment to a post
// @access  Private
router.post('/comment/:id', auth, postController.addComment);

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, postController.updatePost);

// @route   DELETE api/posts/admin/today
// @desc    Delete all posts created today
// @access  Private
router.delete('/admin/today', auth, postController.deleteTodaysPosts);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, postController.deletePost);

// @route   GET api/posts/:id
// @desc    Get a single post by ID
// @access  Private
router.get('/:id', auth, postController.getPostById);

// @route   PUT api/posts/comment/:postId/:commentId
// @desc    Update a comment
// @access  Private
router.put('/comment/:postId/:commentId', auth, postController.updateComment);

// @route   DELETE api/posts/comment/:postId/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/comment/:postId/:commentId', auth, postController.deleteComment);

module.exports = router;
