const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    pan: { type: String },
    loanType: { type: String, default: 'Personal Loan' }, // Personal, Business, Home Loan
    loanAmount: { type: Number },
    status: { 
        type: String, 
        enum: ['Pending', 'In Process', 'Approved', 'Rejected', 'Disbursed'], 
        default: 'Pending' 
    },
    cibilScore: { type: Number, default: 0 },
    cibilData: { type: Object, default: {} }, // Parsed CIBIL Json
    assignedTo: { type: String, default: 'Unassigned' }, // Telecaller / Staff
    source: { type: String, default: 'Manual Entry' } // Manual or Bulk Excel
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);