const mongoose = require('mongoose');

const SalesManagerSchema = new mongoose.Schema({
  bankName: { type: String, required: true }, // e.g. HDFC, ICICI, Bajaj Finance
  state: { type: String, required: true },    // e.g. Rajasthan, Maharashtra
  district: { type: String, required: true }, // e.g. Jaipur, Mumbai
  smName: { type: String, required: true },   // Sales Manager Name
  smPhone: { type: String, required: true },
  smEmail: { type: String },
  loanType: { type: String, default: 'Personal / Business / Home Loan' },
  minCibil: { type: Number, default: 650 },
  minSalary: { type: Number, default: 15000 },
  eligibilityNotes: { type: String, default: 'Standard Bank Policy Applies' }
}, { timestamps: true });

module.exports = mongoose.model('SalesManager', SalesManagerSchema);