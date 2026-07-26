const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// 1. Create/Save Lead (Fully Dynamic)
router.post('/add', async (req, res) => {
    try {
        // Direct req.body pass hone se strict: false dynamic fields save kar leta hai
        const newLead = new Lead(req.body);
        const savedLead = await newLead.save();

        res.status(201).json({
            success: true,
            message: "Lead saved successfully!",
            data: savedLead
        });
    } catch (error) {
        console.error("Save Lead Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to save lead"
        });
    }
});

// 2. Fetch All Leads (For Displaying in Board / Table)
router.get('/all', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;