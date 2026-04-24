const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
    try {
        const { title, content, branchTag, category, isAdminPost } = req.body;

        // Default to the user's branch if they don't specify one, or validate if they do
        const newPost = new Post({
            title,
            content,
            authorId: req.user.userId,
            branchTag: branchTag || req.user.branch || 'ALL',
            category,
            isAdminPost: (req.user.role === 'admin' && isAdminPost) ? true : false
        });

        const post = await newPost.save();

        // Populate author details to send back (name mainly)
        await post.populate('authorId', 'name branch');
        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const userBranch = req.user.branch;
        const queryTab = req.query.tab;

        let branchFilter = {};
        if (queryTab === 'branch') {
            branchFilter = { branchTag: userBranch };
        } else if (queryTab === 'global') {
            branchFilter = { branchTag: 'ALL' };
        } else {
            // By default, show both branch specific and global
            branchFilter = { branchTag: { $in: [userBranch, 'ALL'] } };
        }

        const posts = await Post.find(branchFilter)
            .populate('authorId', 'name branch')
            .populate('comments.userId', 'name')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.user.userId })
            .populate('authorId', 'name branch')
            .populate('comments.userId', 'name')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching my posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'name branch')
            .populate('comments.userId', 'name');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.params.userId })
            .populate('authorId', 'name branch')
            .populate('comments.userId', 'name')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = post.likes.indexOf(req.user.userId);
        if (index === -1) {
            post.likes.push(req.user.userId); // Like
        } else {
            post.likes.splice(index, 1); // Unlike
        }

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            userId: req.user.userId,
            text
        };

        post.comments.push(newComment);
        await post.save();

        // Populate the newly added comment's user before returning
        await post.populate('comments.userId', 'name');

        res.json(post.comments);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content, branchTag, category } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'User not authorized to update this post' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        if (branchTag) post.branchTag = branchTag;
        if (category) post.category = category;
        // If they checked admin publication flag
        if (req.user.role === 'admin' && req.body.isAdminPost !== undefined) {
            post.isAdminPost = req.body.isAdminPost;
        }

        await post.save();
        await post.populate('authorId', 'name branch');
        await post.populate('comments.userId', 'name');

        res.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only Author or Admin can delete
        if (post.authorId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'User not authorized to delete this post' });
        }

        await post.deleteOne();

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTodaysPosts = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Allow any authenticated user to trigger this for testing/demo purposes based on prompt
        const result = await Post.deleteMany({ createdAt: { $gte: startOfDay } });

        res.json({ message: 'Deleted posts created today', deletedCount: result.deletedCount });
    } catch (error) {
        console.error("Error deleting today's posts:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment text cannot be empty' });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only original commenter or Admin can edit
        if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'User not authorized to update this comment' });
        }

        comment.text = text;

        await post.save();
        await post.populate('comments.userId', 'name');

        res.json(post.comments);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Original commenter, Post Author, or Admin can delete
        if (
            comment.userId.toString() !== req.user.userId && 
            post.authorId.toString() !== req.user.userId &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'User not authorized to delete this comment' });
        }

        comment.deleteOne();

        await post.save();
        await post.populate('comments.userId', 'name');

        res.json(post.comments);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
