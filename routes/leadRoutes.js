const express = require('express');
const router = express.Router();
// Apka Lead ya Application Model import karein (jo bhi aap use kar rahe hain)
// const Lead = require('../models/Lead'); 

// POST: Add File Login / Calling Lead Data
router.post('/file-login', async (req, res) => {
  try {
    // Safety check: Agar req.body khali / undefined aaye
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty or invalid JSON. Please send valid data."
      });
    }

    // Default object destructuring taaki TypeError na aaye
    const { 
      dsaCode = 'DEFAULT_DSA', 
      fullName = '', 
      phoneNumber = '', 
      loanType = '' 
    } = req.body;

    // Optional Validation Check
    if (!phoneNumber && !fullName) {
      return res.status(400).json({
        success: false,
        message: "Full Name or Phone Number is required"
      });
    }

    // DATABASE SAVE LOGIC (Model ke according uncomment/adjust karein)
    /*
    const newLead = new Lead({
      dsaCode,
      fullName,
      phoneNumber,
      loanType
    });
    const savedData = await newLead.save();
    */

    // Demo Response
    return res.status(200).json({
      success: true,
      message: "Lead added successfully!",
      data: { dsaCode, fullName, phoneNumber, loanType }
    });

  } catch (error) {
    console.error("Save Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message
    });
  }
});

module.exports = router;