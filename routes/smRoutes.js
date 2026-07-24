const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const SalesManager = require('../models/SalesManager');

const upload = multer({ dest: 'uploads/' });

// 1. Bulk Upload SM List via Excel
router.post('/bulk-upload-sm', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const formattedList = rawData.map(item => ({
      bankName: item['Bank Name'] || item['bankName'] || 'General Bank',
      state: item['State'] || item['state'] || 'All India',
      district: item['District'] || item['district'] || 'All',
      smName: item['SM Name'] || item['smName'] || 'N/A',
      smPhone: item['SM Phone'] || item['smPhone'] || 'N/A',
      smEmail: item['SM Email'] || item['smEmail'] || '',
      loanType: item['Loan Type'] || item['loanType'] || 'Personal Loan',
      minCibil: Number(item['Min CIBIL'] || item['minCibil']) || 650,
      minSalary: Number(item['Min Salary'] || item['minSalary']) || 15000,
      eligibilityNotes: item['Eligibility Criteria'] || item['eligibilityNotes'] || 'Standard Rules'
    }));

    await SalesManager.insertMany(formattedList);
    res.status(200).json({ success: true, message: `${formattedList.length} Bank Sales Managers & Eligibility Rules Uploaded Successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Fetch All SMs
router.get('/all', async (req, res) => {
  try {
    const sms = await SalesManager.find().sort({ bankName: 1, state: 1 });
    res.status(200).json({ success: true, sms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. AUTO-LOOKUP: Lookup SM & Eligibility by Bank & Location
router.get('/lookup', async (req, res) => {
  try {
    const { bankName, state, district } = req.query;
    let query = {};
    if (bankName) query.bankName = new RegExp(bankName, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');

    const smList = await SalesManager.find(query);
    res.status(200).json({ success: true, smList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;