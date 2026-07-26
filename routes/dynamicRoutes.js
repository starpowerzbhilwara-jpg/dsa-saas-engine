const express = require('express');
const router = express.Router();
const { CustomModule, CustomData } = require('../models/CustomModule');

// 1. Create New Custom Module Structure (UI se Naya Feature Banane Ke Liye)
router.post('/create-module', async (req, res) => {
    try {
        const { moduleName, fields } = req.body;
        const newModule = await CustomModule.findOneAndUpdate(
            { moduleName },
            { moduleName, fields },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: "Module Configured!", data: newModule });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Dynamic Data Save Engine (Naye Module Me Data Save Karne Ke Liye)
router.post('/save-data/:moduleName', async (req, res) => {
    try {
        const { moduleName } = req.params;
        const dynamicEntry = new CustomData({
            moduleName: moduleName,
            data: req.body // Saves complete payload directly
        });
        await dynamicEntry.save();
        res.status(201).json({ success: true, message: "Data Saved!", data: dynamicEntry });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Dynamic Data Fetch Engine (Naye Module Ka Data Render/Display Karne Ke Liye)
router.get('/get-data/:moduleName', async (req, res) => {
    try {
        const { moduleName } = req.params;
        const result = await CustomData.find({ moduleName }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: result.map(item => item.data) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;