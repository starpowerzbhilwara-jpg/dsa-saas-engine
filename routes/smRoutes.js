const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const SalesManager = require('../models/SalesManager');

const upload = multer({ storage: multer.memoryStorage() });

// 1. Fetch All SM Data (Master Directory Table)
router.get('/all', async (req, res) => {
    try {
        const smList = await SalesManager.find().sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: smList });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// 2. Add Single SM Entry
router.post('/add', async (req, res) => {
    try {
        const { state, city, smName, email, mobile, post, product } = req.body;
        const newSM = new SalesManager({ state, city, smName, email, mobile, post, product });
        await newSM.save();
        return res.status(200).json({ status: 'success', message: 'SM added successfully!', data: newSM });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Failed to add SM: ' + error.message });
    }
});

// 3. Bulk Excel Upload with Smart Header Auto-Fetch Engine
router.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'Please upload an Excel file.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const formattedEntries = rawData.map(row => {
            // Helper function to dynamically pick values from flexible excel header names
            const getVal = (keys) => {
                const foundKey = Object.keys(row).find(k => 
                    keys.some(key => k.trim().toLowerCase().includes(key.toLowerCase()))
                );
                return foundKey ? String(row[foundKey]).trim() : '';
            };

            return {
                state: getVal(['state', 'st']),
                city: getVal(['city', 'district', 'location', 'place']),
                smName: getVal(['sm name', 'name', 'manager', 'sales manager']),
                email: getVal(['email', 'mail', 'email id']),
                mobile: getVal(['mobile', 'phone', 'contact', 'number', 'mobile number']),
                post: getVal(['post', 'designation', 'role', 'position']) || 'Sales Manager',
                product: getVal(['product', 'products', 'loan type', 'category']) || 'HL, LAP, PL, BL'
            };
        }).filter(item => item.smName && item.mobile); // Basic validation filter

        if (formattedEntries.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No valid SM data found in Excel sheet.' });
        }

        await SalesManager.insertMany(formattedEntries);
        return res.status(200).json({ 
            status: 'success', 
            message: `Successfully imported & auto-fetched ${formattedEntries.length} SM entries!`,
            count: formattedEntries.length
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Excel import error: ' + error.message });
    }
});

module.exports = router;