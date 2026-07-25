const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Lead = require('../models/Lead');
const BankConfig = require('../models/BankConfig');

// Setup Document Storage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// File Login with Document Upload & Auto CAM Matching
router.post('/file-login', upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
    { name: 'salarySlip', maxCount: 1 }
]), async (req, res) => {
    try {
        const { applicantName, phone, email, city, loanProduct, monthlyIncome, existingEmi, bouncingCount, requestedAmount } = req.body;

        const income = Number(monthlyIncome) || 0;
        const emi = Number(existingEmi) || 0;
        const bounce = Number(bouncingCount) || 0;
        const reqAmt = Number(requestedAmount) || 0;

        // CAM Math Logic
        const maxEmi = (income * 0.50) - emi;
        const approvedAmt = Math.min(maxEmi * 48, reqAmt);
        
        let status = 'Eligible';
        let rejectionReason = '';

        if (bounce > 2) {
            status = 'Rejected';
            rejectionReason = 'Banking Bouncing is greater than 2';
        } else if (maxEmi <= 0) {
            status = 'Rejected';
            rejectionReason = 'High Obligations (FOIR Exceeded)';
        }

        // Fetch Matching Banks for Product
        let eligibleBankIds = [];
        if (status === 'Eligible') {
            const allBanks = await BankConfig.find({ isActive: true });
            const matched = allBanks.filter(b => !b.productsSupported.length || b.productsSupported.includes(loanProduct));
            eligibleBankIds = matched.map(b => b._id);
        }

        const newLead = new Lead({
            applicantName, phone, email, city, loanProduct,
            monthlyIncome: income, existingEmi: emi, bouncingCount: bounce, requestedAmount: reqAmt,
            documents: {
                panCard: req.files['panCard'] ? req.files['panCard'][0].path : '',
                aadhaarCard: req.files['aadhaarCard'] ? req.files['aadhaarCard'][0].path : '',
                bankStatement: req.files['bankStatement'] ? req.files['bankStatement'][0].path : '',
                salarySlip: req.files['salarySlip'] ? req.files['salarySlip'][0].path : ''
            },
            camCalculated: {
                maxEmiAllowed: maxEmi > 0 ? maxEmi : 0,
                approvedAmount: approvedAmt > 0 ? approvedAmt : 0,
                abbAmount: income * 0.40,
                status,
                rejectionReason
            },
            eligibleBankIds
        });

        await newLead.save();

        const populatedLead = await Lead.findById(newLead._id).populate('eligibleBankIds');

        return res.status(200).json({
            status: 'success',
            message: 'File Logged & Documents Uploaded Successfully!',
            data: populatedLead
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;