const User = require('../models/User');
const mongoose = require('mongoose');

exports.toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.userId;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const user = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User to follow not found." });
        }

        const isFollowing = user.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            user.following = user.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        } else {
            // Follow
            user.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await user.save();
        await targetUser.save();

        res.json({ following: user.following, isFollowing: !isFollowing });
    } catch (error) {
        console.error('Error toggling follow:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.following || []);
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Exclude sensitive information dynamically if needed, 
        // though .select('-password') handles the main one.
        res.json({
            _id: user._id,
            name: user.name,
            branch: user.branch,
            skills: user.skills,
            githubUrl: user.githubUrl,
            linkedinUrl: user.linkedinUrl,
            universityEmail: user.universityEmail
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
