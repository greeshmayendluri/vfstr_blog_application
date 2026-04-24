const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

async function verifyPriorityFeed() {
    try {
        await mongoose.connect('mongodb://localhost:27017/universityBlog');
        console.log('Connected to DB');

        // Reset test data
        await User.deleteMany({ universityEmail: { $in: ['admin@uni.edu', 'student@uni.edu', 'other@uni.edu'] } });
        await Post.deleteMany({ title: { $in: ['Admin Post', 'Followed Post', 'Regular Post'] } });

        // 1. Create Users
        const admin = new User({ name: 'Admin', universityEmail: 'admin@uni.edu', password: 'password123', branch: 'CSE' });
        const otherUser = new User({ name: 'Other', universityEmail: 'other@uni.edu', password: 'password123', branch: 'CSE' });
        const student = new User({
            name: 'Student',
            universityEmail: 'student@uni.edu',
            password: 'password123',
            branch: 'CSE',
            following: []
        });

        await admin.save();
        await otherUser.save();
        await student.save();

        // 2. Admin follow/unfollow logic test
        // Let student follow admin
        student.following.push(admin._id);
        admin.followers.push(student._id);
        await student.save();
        await admin.save();

        console.log('Follow relationship established');

        // 3. Create Posts
        const post1 = new Post({ title: 'Regular Post', content: 'C', authorId: otherUser._id, branchTag: 'CSE', category: 'General' });
        const post2 = new Post({ title: 'Followed Post', content: 'B', authorId: admin._id, branchTag: 'CSE', category: 'Placements' });

        await post1.save();
        await post2.save();

        // 4. Run Aggregation logic
        const following = [admin._id];
        const posts = await Post.aggregate([
            { $match: { branchTag: 'CSE' } },
            { $addFields: { isFollowed: { $in: ["$authorId", following] } } },
            { $sort: { isFollowed: -1, createdAt: -1 } }
        ]);

        console.log('Results:');
        posts.forEach(p => console.log(`- ${p.title} (isFollowed: ${p.isFollowed})`));

        if (posts[0].title === 'Followed Post') {
            console.log('SUCCESS: Followed post is at the top!');
        } else {
            console.log('FAILURE: Followed post is NOT at the top.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyPriorityFeed();
