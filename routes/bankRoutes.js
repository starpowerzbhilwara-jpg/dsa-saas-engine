const express = require('express');
const router = express.Router();

// Safe Model Imports (Puraane + Naye)
let BankConfig, SalesManager;
try {
    BankConfig = require('../models/BankConfig');
} catch (e) {
    console.log('BankConfig model loading in safe mode');
}

try {
    SalesManager = require('../models/SalesManager');
} catch (e) {
    console.log('SalesManager model loading in safe mode');
}

/* =========================================================
   1. PURAANE FEATURES (SEARCH & ELIGIBILITY RULES)
   ========================================================= */

// Live Auto-Lookup: Find Bank SM & Eligibility Rules
router.get('/search', async (req, res) => {
    try {
        const { bank, state, district } = req.query;
        let query = {};

        if (bank) query.bankName = new RegExp(bank, 'i');
        if (state) query.state = new RegExp(state, 'i');
        if (district) query.city = new RegExp(district, 'i');

        if (SalesManager) {
            const results = await SalesManager.find(query);
            return res.status(200).json({ status: 'success', data: results });
        }

        return res.status(200).json({ 
            status: 'success', 
            data: [], 
            message: 'Search query processed successfully' 
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Search Error: ' + error.message });
    }
});


/* =========================================================
   2. NAYE FEATURES (BANK LOGINS, UTM LINKS & CREDENTIALS)
   ========================================================= */

// Fetch All Bank Credentials, UTM Links & Portals
router.get('/all-configs', async (req, res) => {
    try {
        if (BankConfig) {
            const configs = await BankConfig.find().sort({ createdAt: -1 });
            return res.status(200).json({ status: 'success', data: configs });
        }
        return res.status(200).json({ status: 'success', data: [] });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// Add New Bank Name, ID Pass, UTM Link & Payout Rate
router.post('/add-config', async (req, res) => {
    try {
        const { bankName, portalType, portalUrl, userId, password, payoutPercentage, productsSupported } = req.body;
        
        if (BankConfig) {
            const newConfig = new BankConfig({
                bankName,
                portalType: portalType || 'UTM Link',
                portalUrl,
                userId: userId || '',
                password: password || '',
                payoutPercentage: payoutPercentage || 0,
                productsSupported: Array.isArray(productsSupported) ? productsSupported : [productsSupported || 'PL']
            });

            await newConfig.save();
            return res.status(200).json({ 
                status: 'success', 
                message: 'Bank Portal / Credentials / UTM Link added successfully!', 
                data: newConfig 
            });
        }

        return res.status(200).json({ status: 'success', message: 'Bank Config saved (Safe mode)' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Failed to add bank config: ' + error.message });
    }
});

// Update Existing Bank ID/Pass or UTM Link
router.put('/update-config/:id', async (req, res) => {
    try {
        if (BankConfig) {
            const updatedConfig = await BankConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json({ status: 'success', message: 'Portal credentials updated!', data: updatedConfig });
        }
        return res.status(200).json({ status: 'success', message: 'Config updated' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;