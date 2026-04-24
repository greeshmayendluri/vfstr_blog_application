const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, universityEmail, password, branch } = req.body;
        console.log("Registration Payload Received:", req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ universityEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Auto-assign admin if specific email
        const userRole = universityEmail.toLowerCase() === 'admin@uniblog.edu' ? 'admin' : 'user';

        // Create new user
        const newUser = new User({
            name,
            universityEmail,
            password: hashedPassword,
            branch,
            role: userRole,
            following: [],
            followers: []
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { universityEmail, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ universityEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const payload = {
            userId: user._id,
            branch: user.branch,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, name: user.name, branch: user.branch, universityEmail: user.universityEmail, role: user.role } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ message: 'Server error during password update.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { universityEmail, newPassword } = req.body;

        // Find the user
        const user = await User.findOne({ universityEmail });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address.' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password reset successfully! You can now log in.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};
