const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  dsaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // e.g., "July 2026"
  totalDisbursedAmount: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 1.5 }, // % commission rate
  totalEarning: { type: Number, default: 0 }, // Calculated Amount
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  payoutStatus: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Paid', 'Hold'], 
    default: 'Pending' 
  },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Payout || mongoose.model('Payout', payoutSchema);