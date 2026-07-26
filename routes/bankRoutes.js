const express = require('express');
const router = express.Router();
const BankConfig = require('../models/BankConfig');

// 1. GET ALL BANKS CONFIG (For Admin Dashboard)
router.get('/all', async (req, res) => {
    try {
        const banks = await BankConfig.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: banks.length,
            data: banks
        });
    } catch (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. CREATE OR UPDATE BANK CONFIG
router.post('/save', async (req, res) => {
    try {
        const {
            _id,
            bankName,
            code,
            minSalary,
            foirPercent,
            minCibil,
            maxBouncingAllowed,
            interestRate,
            maxTenureMonths,
            payoutPercentage,
            isActive
        } = req.body;

        let bank;
        if (_id) {
            // Update existing bank
            bank = await BankConfig.findByIdAndUpdate(
                _id,
                {
                    bankName,
                    code,
                    minSalary: Number(minSalary) || 0,
                    foirPercent: Number(foirPercent) || 50,
                    minCibil: Number(minCibil) || 650,
                    maxBouncingAllowed: Number(maxBouncingAllowed) || 0,
                    interestRate: Number(interestRate) || 0,
                    maxTenureMonths: Number(maxTenureMonths) || 60,
                    payoutPercentage: Number(payoutPercentage) || 0,
                    isActive: isActive !== undefined ? isActive : true
                },
                { new: true }
            );
        } else {
            // Create new bank
            bank = new BankConfig({
                bankName,
                code,
                minSalary: Number(minSalary) || 0,
                foirPercent: Number(foirPercent) || 50,
                minCibil: Number(minCibil) || 650,
                maxBouncingAllowed: Number(maxBouncingAllowed) || 0,
                interestRate: Number(interestRate) || 0,
                maxTenureMonths: Number(maxTenureMonths) || 60,
                payoutPercentage: Number(payoutPercentage) || 0,
                isActive: isActive !== undefined ? isActive : true
            });
            await bank.save();
        }

        res.status(200).json({
            success: true,
            message: 'Bank configuration saved successfully',
            data: bank
        });
    } catch (error) {
        console.error('Error saving bank config:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. TOGGLE BANK ACTIVE/INACTIVE STATUS
router.patch('/toggle-status/:id', async (req, res) => {
    try {
        const bank = await BankConfig.findById(req.params.id);
        if (!bank) {
            return res.status(404).json({ success: false, message: 'Bank not found' });
        }
        bank.isActive = !bank.isActive;
        await bank.save();

        res.status(200).json({
            success: true,
            message: `Bank status changed to ${bank.isActive ? 'Active' : 'Inactive'}`,
            data: bank
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. DELETE BANK CONFIG
router.delete('/delete/:id', async (req, res) => {
    try {
        await BankConfig.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Bank configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;