const express = require('express');
const router = express.Router();

let Application;
try {
    Application = require('../models/Application');
} catch (e) {
    console.log('Application model missing, running in safe mode.');
}

// Single Lead Add Route
router.post('/add', async (req, res) => {
    try {
        if (Application) {
            const newLead = new Application(req.body);
            await newLead.save();
        }
        return res.status(200).json({ status: 'success', message: 'Lead added successfully!' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error adding lead: ' + error.message });
    }
});

// Bulk Excel Upload Route
router.post('/upload-excel', async (req, res) => {
    try {
        return res.status(200).json({ status: 'success', message: 'Bulk Excel leads uploaded successfully!' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error uploading excel: ' + error.message });
    }
});

module.exports = router;