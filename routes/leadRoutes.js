const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// POST: Add / File-Login New Lead
router.post('/file-login', async (req, res) => {
    try {
        console.log("Incoming Data:", req.body); // Terminal me log dekhein

        const {
            dsaCode,
            applicantName,
            phone,
            city,
            loanProduct,
            monthlyIncome,
            existingEmi,
            bouncingCount,
            requestedAmount
        } = req.body;

        // Basic Validation
        if (!applicantName || !phone) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Name and Phone number are required fields.' 
            });
        }

        // New Lead Create Karein
        const newLead = new Lead({
            dsaCode: dsaCode || 'DIRECT',
            applicantName,
            phone,
            city,
            loanProduct,
            monthlyIncome: Number(monthlyIncome) || 0,
            existingEmi: Number(existingEmi) || 0,
            bouncingCount: Number(bouncingCount) || 0,
            requestedAmount: Number(requestedAmount) || 0
        });

        // Database me Save Karein
        const savedLead = await newLead.save();

        return res.status(200).json({
            status: 'success',
            message: 'Lead saved successfully!',
            data: savedLead
        });

    } catch (error) {
        console.error("Save Lead Error:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Server error while saving lead',
            error: error.message
        });
    }
});

// GET: Fetch All Leads (Dashboard par dikhane ke liye)
router.get('/all', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: leads });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;