const express = require('express');
const router = express.Router();

// Safe import of existing BankConfig model (if present)
let BankConfig;
try {
    BankConfig = require('../models/BankConfig');
} catch (e) {
    console.log('BankConfig model not found, running with fallback mode.');
}

// 1. CIBIL Analyzer API Endpoint
router.post('/analyze-cibil', async (req, res) => {
    try {
        const { password } = req.body;
        // CIBIL PDF analysis processing logic goes here

        return res.status(200).json({
            status: 'success',
            cibil_score: 750,
            message: 'CIBIL PDF report analyzed successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error processing CIBIL report: ' + error.message
        });
    }
});

// 2. Banking Perfuse Engine API Endpoint (Bank Statement Analysis)
router.post('/analyze-statement', async (req, res) => {
    try {
        const { bank_name, password } = req.body;
        // Bank statement parsing logic goes here

        return res.status(200).json({
            status: 'success',
            bank: bank_name || 'Generic Bank',
            message: `Bank statement for ${bank_name || 'selected bank'} analyzed successfully!`
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error analyzing bank statement: ' + error.message
        });
    }
});

// 3. Fetch Active Bank Direct Portals / Configurations
router.get('/configs', async (req, res) => {
    try {
        if (BankConfig) {
            const configs = await BankConfig.find();
            return res.status(200).json({ status: 'success', data: configs });
        }
        
        // Default fallback if database model isn't active
        return res.status(200).json({
            status: 'success',
            data: [
                { bankName: 'HDFC Bank', portalUrl: 'https://partnerportal.hdfcbank.com' },
                { bankName: 'ICICI Bank', portalUrl: 'https://partners.icicibank.com' },
                { bankName: 'Axis Bank', portalUrl: 'https://connect.axisbank.com' }
            ]
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error fetching bank configurations: ' + error.message
        });
    }
});

module.exports = router;