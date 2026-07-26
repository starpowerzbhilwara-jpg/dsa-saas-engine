const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// 1. CREATE LEAD (Auto Source Detection & User Linking)
router.post('/create', async (req, res) => {
    try {
        const {
            applicantName,
            phone,
            city,
            loanProduct,
            monthlyIncome,
            existingEmi,
            bouncingCount,
            requestedAmount,
            dsaCode,
            createdBy,
            userRole,
            customFields
        } = req.body;

        // Auto-detect lead source
        let detectedSource = 'Customer (Online)';
        if (userRole === 'DSA' || userRole === 'AGENT') {
            detectedSource = 'DSA Agent';
        } else if (userRole === 'ADMIN' || userRole === 'STAFF') {
            detectedSource = 'Admin / Staff';
        }

        const newLead = new Lead({
            applicantName,
            phone,
            city,
            loanProduct,
            monthlyIncome: Number(monthlyIncome) || 0,
            existingEmi: Number(existingEmi) || 0,
            bouncingCount: Number(bouncingCount) || 0,
            requestedAmount: Number(requestedAmount) || 0,
            dsaCode: dsaCode || 'DIRECT',
            createdBy: createdBy || null,
            source: detectedSource,
            customFields: customFields || {}
        });

        const savedLead = await newLead.save();
        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: savedLead
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. FETCH ALL LEADS (With Auto User & Source Details)
router.get('/all', async (req, res) => {
    try {
        const leads = await Lead.find()
            .populate('createdBy', 'name email role dsaCode')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;