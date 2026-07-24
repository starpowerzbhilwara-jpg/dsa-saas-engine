const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const Application = require('../models/Application');

const upload = multer({ storage: multer.memoryStorage() });

// 1. Create New Lead/Application
router.post('/create', async (req, res) => {
  try {
    const { customerName, customerPhone, panCard, cibilScore, selectedBank, loanAmount, createdByAgent } = req.body;

    let cibilStatus = 'Pending';
    if (cibilScore) {
      cibilStatus = Number(cibilScore) >= 750 ? 'Verified' : 'Low Score';
    }

    const newApp = new Application({
      customerName,
      customerPhone,
      panCard,
      cibilScore: Number(cibilScore) || 0,
      cibilStatus,
      selectedBank,
      loanAmount: Number(loanAmount) || 0,
      createdByAgent
    });

    await newApp.save();
    res.status(201).json({ success: true, message: 'Lead Successfully Created!', application: newApp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Bulk Excel Data Upload (Calling Data, SM, Banking)
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel/CSV file' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let importedCount = 0;

    for (let row of sheetData) {
      const cibilScoreNum = Number(row.CibilScore) || 0;
      
      const newApp = new Application({
        customerName: row.CustomerName || 'N/A',
        customerPhone: row.CustomerPhone ? String(row.CustomerPhone) : 'N/A',
        panCard: row.PanCard || 'N/A',
        cibilScore: cibilScoreNum,
        cibilStatus: cibilScoreNum >= 750 ? 'Verified' : 'Low Score',
        selectedBank: row.Bank || 'HDFC Bank',
        loanAmount: Number(row.LoanAmount) || 0,
        applicationStatus: row.Status || 'New Lead',
        remarks: row.Remarks || 'Bulk Excel Uploaded'
      });

      await newApp.save();
      importedCount++;
    }

    res.status(200).json({ 
      success: true, 
      message: `Bulk Import Successful! ${importedCount} Leads Processed.` 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get All Applications List
router.get('/all', async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('createdByAgent', 'name agentCode')
      .populate('assignedCaller', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;