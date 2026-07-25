const express = require('express');
const router = express.Router();
const BankConfig = require('../models/BankConfig');

// Add or Update Bank / UTM Config
router.post('/add', async (req, res) => {
    try {
        const { bankName, portalType, portalUrl, userId, password, payoutPercentage, productsSupported, adminOtpPhone } = req.body;
        
        const newConfig = new BankConfig({
            bankName,
            portalType: portalType || 'UTM Link',
            portalUrl,
            userId,
            password,
            payoutPercentage: payoutPercentage || 0,
            productsSupported: productsSupported || ['PL', 'HL', 'LAP', 'BL'],
            adminOtpPhone: adminOtpPhone || '+91-9876543210'
        });

        await newConfig.save();
        return res.status(200).json({ status: 'success', message: 'Bank Config saved successfully!', data: newConfig });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get All Bank Configs
router.get('/all-configs', async (req, res) => {
    try {
        const configs = await BankConfig.find({ isActive: true }).sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: configs });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Auto-Eligibility & Statement CAM Analysis Engine
router.post('/analyze-eligibility', async (req, res) => {
    try {
        const { monthlySalary, existingEmi, bouncedCheques, requestedLoan } = req.body;
        
        const netIncome = Number(monthlySalary) || 25000;
        const totalEmi = Number(existingEmi) || 0;
        const bouncing = Number(bouncedCheques) || 0;
        
        const foir = 0.50; // 50% FOIR Limit
        const maxAllowedEmi = (netIncome * foir) - totalEmi;
        
        let status = 'Eligible';
        let rejectReason = '';
        
        if (bouncing > 2) {
            status = 'Rejected';
            rejectReason = 'High Bank Bouncing (>2 instances detected)';
        } else if (maxAllowedEmi <= 0) {
            status = 'Rejected';
            rejectReason = 'FOIR Exceeded / High Existing Loan EMI Obligations';
        }

        const calculatedLoanLimit = Math.max(0, maxAllowedEmi * 48); // 4 Years Tenure

        return res.status(200).json({
            status: 'success',
            data: {
                status,
                rejectReason,
                abb: netIncome * 0.40, // Estimated Average Bank Balance
                bouncingCount: bouncing,
                maxAllowedEmi: maxAllowedEmi > 0 ? maxAllowedEmi : 0,
                approvedLoanAmount: Math.min(calculatedLoanLimit, Number(requestedLoan) || 500000)
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;