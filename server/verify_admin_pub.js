const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

async function testAdminPublication() {
    try {
        await mongoose.connect('mongodb://localhost:27017/universityBlog');
        console.log('Connected to DB');

        // 1. Create an Admin User
        let admin = await User.findOne({ universityEmail: 'admin@uni.edu' });
        if (!admin) {
            admin = new User({
                name: 'Placement Cell',
                universityEmail: 'admin@uni.edu',
                password: 'password123',
                branch: 'CSE',
            });
            await admin.save();
        }

        // 2. Create a Student User
        let student = await User.findOne({ universityEmail: 'student@uni.edu' });
        if (!student) {
            student = new User({
                name: 'Student User',
                universityEmail: 'student@uni.edu',
                password: 'password123',
                branch: 'CSE',
                following: [admin._id] // Student follows Admin
            });
            await student.save();
        } else {
            // Ensure student follows admin for test
            if (!student.following.includes(admin._id)) {
                student.following.push(admin._id);
                await student.save();
            }
        }

        // 3. Create an Admin Post
        const adminPost = new Post({
            title: 'Major Hiring Drive 2026',
            content: 'Register now for the major hiring drive starting next week...',
            authorId: admin._id,
            branchTag: 'ALL',
            category: 'Placements',
            isAdminPost: true,
            adminType: 'Placement Cell'
        });
        await adminPost.save();

        // 4. Create a regular Post
        const regularPost = new Post({
            title: 'Study Tips for Exams',
            content: 'Here are some tips to help you study better...',
            authorId: student._id,
            branchTag: 'CSE',
            category: 'Academic'
        });
        await regularPost.save();

        console.log('Seed data created successfully');

        // 5. Test priority sorting logic (simulating controller)
        const user = await User.findById(student._id);
        const following = user.following || [];

        const posts = await Post.find({
            branchTag: { $in: ['CSE', 'ALL'] }
        }).populate('authorId', 'name branch').lean();

        posts.sort((a, b) => {
            const aIsFollowedAdmin = a.isAdminPost && following.some(f => f.toString() === a.authorId._id.toString());
            const bIsFollowedAdmin = b.isAdminPost && following.some(f => f.toString() === b.authorId._id.toString());

            if (aIsFollowedAdmin && !bIsFollowedAdmin) return -1;
            if (!aIsFollowedAdmin && bIsFollowedAdmin) return 1;

            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        console.log('Sorted Posts Order:');
        posts.forEach(p => console.log(`- ${p.title} (isAdmin: ${p.isAdminPost})`));

        if (posts[0].isAdminPost) {
            console.log('SUCCESS: Admin post is at the top!');
        } else {
            console.log('FAILURE: Admin post is NOT at the top.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testAdminPublication();
