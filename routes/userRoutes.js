const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register DSA / User with Auto Unique Code
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email already registered.' });
        }

        // Auto Generate Unique DSA Code (e.g. DSA101, DSA102)
        const count = await User.countDocuments();
        const dsaCode = `DSA${101 + count}`;

        const newUser = new User({
            name,
            email,
            password,
            role: role || 'DSA',
            dsaCode
        });

        await newUser.save();
        res.json({ status: 'success', data: newUser });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Get All Users / DSAs List
router.get('/all', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ status: 'success', data: users });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;