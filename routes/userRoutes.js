const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create Staff / Agent / DSA
router.post('/create-staff', async (req, res) => {
    try {
        const { name, email, phone, password, role, city, state } = req.body;

        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'Is Email/User ID se pehle se account hai. Kripya naya Unique Email/ID daalein.' 
            });
        }

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const agentCode = `${role.substring(0, 3).toUpperCase()}-${randomNum}`;

        const newUser = new User({
            name,
            email,
            phone,
            password,
            role,
            city,
            state,
            agentCode
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: `${role} (${agentCode}) User Created Successfully!`,
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fetch All Staff List
router.get('/all-staff', async (req, res) => {
    try {
        const staffList = await User.find({ role: { $ne: 'Customer' } }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, staff: staffList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;