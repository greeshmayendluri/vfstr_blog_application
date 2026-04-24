const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

async function debugGetPosts() {
    try {
        await mongoose.connect('mongodb://localhost:27017/universityBlog');
        console.log('Connected to DB');

        // Simulate a user (e.g., the student from earlier test)
        const user = await User.findOne({ universityEmail: 'student@uni.edu' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const following = (user.following || []).map(id => new mongoose.Types.ObjectId(id));
        const branchFilter = [user.branch, 'ALL'];

        console.log('User following size:', following.length);
        console.log('Branch filter:', branchFilter);

        const posts = await Post.aggregate([
            {
                $match: {
                    branchTag: { $in: branchFilter }
                }
            },
            {
                $addFields: {
                    isFollowed: {
                        $in: ["$authorId", following]
                    }
                }
            },
            {
                $sort: {
                    isFollowed: -1,
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorId'
                }
            },
            {
                $unwind: '$authorId'
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    branchTag: 1,
                    category: 1,
                    likes: 1,
                    comments: 1,
                    isAdminPost: 1,
                    adminType: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isFollowed: 1,
                    'authorId.name': 1,
                    'authorId.branch': 1,
                    'authorId._id': 1
                }
            }
        ]);

        console.log('Post count:', posts.length);
        if (posts.length > 0) {
            console.log('First post:', JSON.stringify(posts[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugGetPosts();
