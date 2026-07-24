const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');

// 1. Create or Update DSA Payout Sheet
router.post('/update-sheet', async (req, res) => {
  try {
    const { dsaId, month, totalDisbursedAmount, commissionRate, paidAmount, payoutStatus, remarks } = req.body;

    const disbAmount = Number(totalDisbursedAmount) || 0;
    const commRate = Number(commissionRate) || 1.5;
    const paid = Number(paidAmount) || 0;

    const totalEarning = (disbAmount * commRate) / 100;
    const pendingAmount = totalEarning - paid;

    let payout = await Payout.findOne({ dsaId, month });

    if (payout) {
      payout.totalDisbursedAmount = disbAmount;
      payout.commissionRate = commRate;
      payout.totalEarning = totalEarning;
      payout.paidAmount = paid;
      payout.pendingAmount = pendingAmount;
      payout.payoutStatus = payoutStatus || 'Pending';
      payout.remarks = remarks || '';
      await payout.save();
    } else {
      payout = new Payout({
        dsaId, month, totalDisbursedAmount: disbAmount, commissionRate: commRate, totalEarning, paidAmount: paid, pendingAmount, payoutStatus, remarks
      });
      await payout.save();
    }

    res.status(200).json({ success: true, message: 'Payout Sheet Updated Successfully!', payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Fetch All DSA Payouts List
router.get('/all', async (req, res) => {
  try {
    const payouts = await Payout.find().populate('dsaId', 'name agentCode email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Fetch Single DSA Payout by ID
router.get('/dsa/:dsaId', async (req, res) => {
  try {
    const payouts = await Payout.find({ dsaId: req.params.dsaId }).populate('dsaId', 'name agentCode email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;