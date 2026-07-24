const mongoose = require('mongoose');

// Har Single Product ki Policy ka Schema
const productPolicySchema = new mongoose.Schema({
  loanType: { 
    type: String, 
    required: true, 
    trim: true // e.g., 'Personal Loan', 'Home Loan', 'Business Loan'
  },
  minIncome: { type: Number, default: 0 },
  minCreditScore: { type: Number, default: 600 },
  allowedEmploymentType: [{ type: String }], // e.g., ['Salaried', 'Self-Employed']
  policyDetails: {
    minAge: { type: Number, default: 21 },
    maxAge: { type: Number, default: 60 },
    minWorkExpMonths: { type: Number, default: 6 }
  }
});

// Main Bank Schema
const bankConfigSchema = new mongoose.Schema({
  bankName: { type: String, required: true, unique: true, trim: true },
  portalUrl: { type: String, trim: true },
  loginId: { type: String, required: true },
  password: { type: String, required: true },
  
  // Array of Products & Policy Details
  products: [productPolicySchema]
}, { timestamps: true });

module.exports = mongoose.model('BankConfig', bankConfigSchema);