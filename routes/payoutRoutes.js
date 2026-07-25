const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');

// Helper to generate Invoice Number (e.g. INV-2026-1001)
const generateInvoiceNo = () => 'INV-' + Date.now().toString().slice(-6);

// 1. Add / Record New Disbursed Payout (Admin Entry)
router.post('/add', async (req, res) => {
    try {
        const { agentName, agentEmail, applicantName, bankName, productType, loanAmount, payoutPercentage, status } = req.body;
        
        const calculatedPayout = (Number(loanAmount) * Number(payoutPercentage)) / 100;

        const newPayout = new Payout({
            invoiceNumber: generateInvoiceNo(),
            agentName,
            agentEmail,
            applicantName,
            bankName,
            productType,
            loanAmount: Number(loanAmount),
            payoutPercentage: Number(payoutPercentage),
            payoutAmount: calculatedPayout,
            status: status || 'Paid'
        });

        await newPayout.save();
        return res.status(200).json({ status: 'success', message: 'Payout & Disbursed Case recorded successfully!', data: newPayout });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Payout Addition Error: ' + error.message });
    }
});

// 2. Fetch All Payouts (Master Ledger for Admin)
router.get('/all', async (req, res) => {
    try {
        const payouts = await Payout.find().sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: payouts });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// 3. Fetch Agent Specific Payout Ledger (Filter by Agent Email or Name)
router.get('/agent-ledger', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ status: 'error', message: 'Agent Email required' });
        }
        const agentPayouts = await Payout.find({ agentEmail: email }).sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: agentPayouts });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;