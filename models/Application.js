const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Customer Details
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  panCard: { type: String, required: true },
  
  // Financial & CIBIL Status
  cibilScore: { type: Number, default: 0 },
  cibilStatus: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Low Score', 'Rejected'], 
    default: 'Pending' 
  },

  // Banking Details
  selectedBank: { type: String, required: true }, // e.g., HDFC, ICICI, SBI
  loanAmount: { type: Number, required: true },
  loanType: { type: String, default: 'Personal Loan' }, // Personal, Home, Business Loan

  // Staff & Assignment Workflow
  createdByAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Agent ID
  assignedCaller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Calling Staff ID

  // Status Track
  applicationStatus: { 
    type: String, 
    enum: ['New Lead', 'Calling In Progress', 'Documents Pending', 'Sent to Bank', 'Disbursed', 'Rejected'], 
    default: 'New Lead' 
  },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);