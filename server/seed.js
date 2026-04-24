require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/universityBlog');
        console.log('Connected to MongoDB. Purging existing data for clean seed...');

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});

        // Create Seed Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.insertMany([
            { name: "Alice Admin", universityEmail: "alice.admin@university.edu", password: hashedPassword, branch: "CSE", skills: ["React", "Express"] },
            { name: "Bob Builder", universityEmail: "bob.b@university.edu", password: hashedPassword, branch: "CIVIL", skills: ["AutoCAD", "Structures"] },
            { name: "Charlie Chips", universityEmail: "charlie.c@university.edu", password: hashedPassword, branch: "ECE", skills: ["VHDL", "Arduino"] },
            { name: "Diana Data", universityEmail: "diana.d@university.edu", password: hashedPassword, branch: "AI & DS", skills: ["Python", "TensorFlow"] }
        ]);

        console.log('Seed users injected.');

        // Reference specifically to Alice (CSE) and Diana (AI)
        const getUserId = (name) => users.find(u => u.name === name)._id;

        // Create Seed Posts
        const samplePosts = [
            {
                title: "Top IT Placements for 2026 Batch",
                content: "Several top-tier companies including Microsoft and Amazon will be visiting campus next month specifically targeting CS backgrounds. Prepare your resumes!",
                authorId: getUserId("Alice Admin"),
                branchTag: "CSE",
                category: "Placements",
                likes: [getUserId("Diana Data")],
                comments: []
            },
            {
                title: "Introduction to Generative AI Workshop",
                content: "We are thrilled to announce a comprehensive 3-day workshop regarding LLMs and Transformer architectures. Highly recommended for AI & DS students.",
                authorId: getUserId("Diana Data"),
                branchTag: "AI & DS",
                category: "Events",
                likes: [getUserId("Alice Admin")],
                comments: [{ userId: getUserId("Alice Admin"), text: "Looking forward to this!", createdAt: new Date() }]
            },
            {
                title: "Advanced Circuit Design - Project Lab Hours",
                content: "The VLSI lab will remain open until 9 PM for ECE students completing their final year projects.",
                authorId: getUserId("Charlie Chips"),
                branchTag: "ECE",
                category: "Projects",
                likes: [],
                comments: []
            },
            {
                title: "Global University Hackathon 2026!",
                content: "Calling all innovators! Registration is now open for the multidisciplinary hackathon spanning all departments. Collaborate across branches.",
                authorId: getUserId("Alice Admin"),
                branchTag: "ALL",
                category: "General",
                likes: [getUserId("Bob Builder"), getUserId("Charlie Chips"), getUserId("Diana Data")],
                comments: [{ userId: getUserId("Bob Builder"), text: "Does anyone want to form a team?", createdAt: new Date() }]
            },
            {
                title: "Bridge Construction Symposium",
                content: "A guest lecture by leading structural engineers on modern long-span suspension systems.",
                authorId: getUserId("Bob Builder"),
                branchTag: "CIVIL",
                category: "Academic",
                likes: [],
                comments: []
            },
            {
                title: "React Native App Development Study Group",
                content: "Starting a weekly study group for cross-platform app dev. CSE juniors and seniors welcome.",
                authorId: getUserId("Alice Admin"),
                branchTag: "CSE",
                category: "Academic",
                likes: [],
                comments: []
            },
            {
                title: "New CUDA Research Paper Published!",
                content: "Our AI department just published a state-of-the-art method for parallel processing neural networks.",
                authorId: getUserId("Diana Data"),
                branchTag: "ALL", // Making it global so everyone sees it
                category: "Research",
                likes: [getUserId("Alice Admin")],
                comments: []
            },
            {
                title: "Robotics Club - Embedded Systems Meeting",
                content: "We need volunteers to help program the new autonomous drifter drones.",
                authorId: getUserId("Charlie Chips"),
                branchTag: "ECE",
                category: "Projects",
                likes: [],
                comments: []
            },
            {
                title: "Web3.0 Smart Contracts Introduction",
                content: "An intro to Solidity and building decentralized applications on Ethereum.",
                authorId: getUserId("Alice Admin"),
                branchTag: "CSE",
                category: "Academic",
                likes: [],
                comments: []
            },
            {
                title: "University Food Festival this Friday",
                content: "Take a break from studying! Food trucks from 5 different cuisines will be stationed near the main administrative building all afternoon.",
                authorId: getUserId("Bob Builder"),
                branchTag: "ALL",
                category: "Events",
                likes: [getUserId("Alice Admin"), getUserId("Charlie Chips"), getUserId("Diana Data")],
                comments: [{ userId: getUserId("Diana Data"), text: "A much needed break!", createdAt: new Date() }]
            }
        ];

        await Post.insertMany(samplePosts);
        console.log(`Successfully injected 10 diverse posts corresponding to multiple departments.`);

        console.log('Seeding procedure complete. Exiting...');
        process.exit(0);

    } catch (err) {
        console.error('Failed to execute database seeding:', err);
        process.exit(1);
    }
};

seedData();
