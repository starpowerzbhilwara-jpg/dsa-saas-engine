const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const BankConfig = require('../models/BankConfig');

// 1. CREATE LEAD WITH AUTO CAM & BANK MATCHING
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

        // Auto Source Detection
        let detectedSource = 'Customer (Online)';
        if (userRole === 'DSA' || userRole === 'AGENT') {
            detectedSource = 'DSA Agent';
        } else if (userRole === 'ADMIN' || userRole === 'STAFF') {
            detectedSource = 'Admin / Staff';
        }

        const income = Number(monthlyIncome) || 0;
        const emi = Number(existingEmi) || 0;
        const bounce = Number(bouncingCount) || 0;

        // Fetch Active Banks for Matching
        const activeBanks = await BankConfig.find({ isActive: true });
        
        let eligibleBankIds = [];
        let maxEmiCapacity = 0;
        let rejectionReason = '';

        if (bounce > 2) {
            rejectionReason = 'High Cheque / Mandate Bouncing Count';
        } else {
            activeBanks.forEach(bank => {
                const minSal = bank.minSalary || 15000;
                const foir = bank.foirPercent || 50;
                const bankMaxEmi = (income * (foir / 100)) - emi;

                if (income >= minSal && bankMaxEmi > 0) {
                    eligibleBankIds.push(bank._id);
                    if (bankMaxEmi > maxEmiCapacity) maxEmiCapacity = bankMaxEmi;
                }
            });
        }

        const status = eligibleBankIds.length > 0 ? 'Eligible' : 'Rejected';
        if (eligibleBankIds.length === 0 && !rejectionReason) {
            rejectionReason = 'Income / FOIR criteria not matched with active banks';
        }

        const calculatedApprovedAmount = Math.max(0, Math.round(maxEmiCapacity * 36));

        const newLead = new Lead({
            applicantName,
            phone,
            city,
            loanProduct,
            monthlyIncome: income,
            existingEmi: emi,
            bouncingCount: bounce,
            requestedAmount: Number(requestedAmount) || 0,
            dsaCode: dsaCode || 'DIRECT',
            createdBy: createdBy || null,
            source: detectedSource,
            customFields: customFields || {},
            camCalculated: {
                foirLimit: 50,
                maxEmiAllowed: Math.max(0, maxEmiCapacity),
                approvedAmount: calculatedApprovedAmount,
                status: status,
                rejectionReason: status === 'Rejected' ? rejectionReason : ''
            },
            eligibleBankIds: eligibleBankIds
        });

        const savedLead = await newLead.save();

        res.status(201).json({
            success: true,
            message: 'Lead created and CAM evaluated successfully',
            data: savedLead
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. FETCH ALL LEADS (Populates CreatedBy & Eligible Banks)
router.get('/all', async (req, res) => {
    try {
        const leads = await Lead.find()
            .populate('createdBy', 'name email role dsaCode')
            .populate('eligibleBankIds', 'bankName minSalary foirPercent')
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