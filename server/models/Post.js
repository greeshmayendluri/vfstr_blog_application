const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    branchTag: {
        type: String,
        required: true,
        enum: ['CSE', 'IT', 'AI & DS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL'],
    },
    category: {
        type: String,
        required: true,
        enum: ['Academic', 'Projects', 'Placements', 'Events', 'Research', 'General'],
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    isAdminPost: {
        type: Boolean,
        default: false
    },
    adminType: {
        type: String, // 'Placement Cell', 'HOD', etc.
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
