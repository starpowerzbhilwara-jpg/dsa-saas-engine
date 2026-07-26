const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const BankConfig = require('../models/BankConfig');
const User = require('../models/User');

// 1. CREATE LEAD & MATCH PAN-INDIA ELIGIBLE BANK UTM LINKS
router.post('/create', async (req, res) => {
    try {
        const {
            applicantName,
            phone,
            city,
            state,
            loanProduct,
            monthlyIncome,
            existingEmi,
            bouncingCount,
            dsaCode,
            createdBy,
            userRole
        } = req.body;

        // Auto Source Detection
        let detectedSource = 'Customer (Online)';
        if (userRole === 'DSA') detectedSource = 'DSA Agent';
        if (userRole === 'CALLER') detectedSource = 'Calling Staff';
        if (userRole === 'ADMIN') detectedSource = 'Admin / Staff';

        const income = Number(monthlyIncome) || 0;
        const emi = Number(existingEmi) || 0;
        const bounce = Number(bouncingCount) || 0;

        // Fetch All Active Banks
        const activeBanks = await BankConfig.find({ isActive: true });
        
        let eligibleBanks = [];
        let maxEmiCapacity = 0;

        if (bounce <= 2) {
            activeBanks.forEach(bank => {
                const minSal = bank.minSalary || 15000;
                const foir = bank.foirPercent || 50;
                const bankMaxEmi = (income * (foir / 100)) - emi;

                if (income >= minSal && bankMaxEmi > 0) {
                    eligibleBanks.push({
                        bankId: bank._id,
                        bankName: bank.bankName,
                        utmLink: bank.utmLink,
                        payoutPercentage: bank.payoutPercentage
                    });
                    if (bankMaxEmi > maxEmiCapacity) maxEmiCapacity = bankMaxEmi;
                }
            });
        }

        const status = eligibleBanks.length > 0 ? 'Eligible' : 'Rejected';
        const estimatedApprovedAmount = Math.max(0, Math.round(maxEmiCapacity * 36));

        const newLead = new Lead({
            applicantName,
            phone,
            city: city || '',
            state: state || 'Pan India',
            loanProduct: loanProduct || 'Personal Loan',
            monthlyIncome: income,
            existingEmi: emi,
            bouncingCount: bounce,
            requestedAmount: Number(req.body.requestedAmount) || 0,
            dsaCode: dsaCode || 'DIRECT',
            createdBy: createdBy || null,
            source: detectedSource,
            camCalculated: {
                foirLimit: 50,
                maxEmiAllowed: Math.max(0, maxEmiCapacity),
                approvedAmount: estimatedApprovedAmount,
                status: status,
                rejectionReason: status === 'Rejected' ? 'Criteria not matched' : ''
            },
            eligibleBankIds: eligibleBanks.map(b => b.bankId)
        });

        const savedLead = await newLead.save();

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: savedLead,
            eligibleBankUtms: eligibleBanks // Returns UTM Links directly for Customer/DSA
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. FETCH LEADS BASED ON ROLE (ADMIN, DSA, CALLER)
router.get('/my-leads', async (req, res) => {
    try {
        const { role, dsaCode, userId } = req.query;
        let query = {};

        if (role === 'DSA') {
            query.dsaCode = dsaCode; // Only show DSA's own leads
        } else if (role === 'CALLER') {
            query.assignedTo = userId; // Only show assigned leads to Caller
        }

        const leads = await Lead.find(query)
            .populate('createdBy', 'name email role dsaCode')
            .populate('eligibleBankIds', 'bankName utmLink')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;