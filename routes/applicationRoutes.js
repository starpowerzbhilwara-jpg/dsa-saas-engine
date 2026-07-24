const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');

// Models
const Application = require('../models/Application');
const BankConfig = require('../models/BankConfig'); // 👈 Eligibility ke liye Naya Model Import

const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------------------------------
// 1. Create New Lead/Application
// ----------------------------------------------------
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

// ----------------------------------------------------
// 2. Bulk Excel Data Upload (Calling Data, SM, Banking)
// ----------------------------------------------------
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

// ----------------------------------------------------
// 3. Get All Applications List
// ----------------------------------------------------
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

// ----------------------------------------------------
// 4. 🏦 Form Submit & Check Bank Eligibility + Direct Links + Policy
// ----------------------------------------------------
router.post('/check-eligibility', async (req, res) => {
  try {
    const { 
      income, 
      employmentType, 
      creditScore, 
      userLocation, 
      loanType,
      age,
      workExperienceMonths 
    } = req.body;

    // 1. Core Eligibility Query (Income, Credit Score, Loan Type)
    let query = {
      minIncome: { $lte: Number(income || 0) },
      minCreditScore: { $lte: Number(creditScore || 0) }
    };

    // Filter by Loan Type/Product (if provided)
    if (loanType) {
      query.$or = [
        { loanTypes: { $exists: false } },
        { loanTypes: { $size: 0 } },
        { loanTypes: loanType }
      ];
    }

    // Filter by Employment Type (if provided)
    if (employmentType) {
      const empCondition = [
        { allowedEmploymentType: { $exists: false } },
        { allowedEmploymentType: { $size: 0 } },
        { allowedEmploymentType: employmentType }
      ];

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: empCondition }
        ];
        delete query.$or;
      } else {
        query.$or = empCondition;
      }
    }

    const potentialBanks = await BankConfig.find(query);

    // 2. Dynamic Banking Policy Filters (Age, Work Exp, Negative Locations)
    const eligibleBanks = potentialBanks.filter(bank => {
      const policy = bank.policyDetails;
      if (!policy) return true; // Agar bank ne details fill nahi ki to allow karega

      // Age Policy
      if (age && (Number(age) < policy.minAge || Number(age) > policy.maxAge)) {
        return false;
      }

      // Experience Policy
      if (workExperienceMonths && (Number(workExperienceMonths) < policy.minWorkExpMonths)) {
        return false;
      }

      // Negative Location Check
      if (userLocation && policy.negativeLocations && policy.negativeLocations.length > 0) {
        const isNegative = policy.negativeLocations.some(
          loc => loc.toLowerCase() === userLocation.toLowerCase()
        );
        if (isNegative) return false;
      }

      return true;
    });

    if (eligibleBanks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aapki provided details ke anusar filhal koi eligible bank match nahi hua.',
        data: []
      });
    }

    // 3. Response Format
    const result = eligibleBanks.map(bank => {
      // Find Location Specific Sales Manager
      const matchedSM = bank.salesManagers ? bank.salesManagers.find(
        sm => sm.location.toLowerCase() === (userLocation || '').toLowerCase()
      ) : null;

      return {
        bankName: bank.bankName,
        portalUrl: bank.portalUrl,
        loginId: bank.loginId,
        password: bank.password,
        offeredLoanTypes: bank.loanTypes || [],
        policyDetails: bank.policyDetails || null,
        assignedSalesManager: matchedSM || (bank.salesManagers ? bank.salesManagers[0] : null)
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;