const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    agentName: { type: String, required: true }, // Agent / Calling Staff / DSA
    agentEmail: { type: String, required: true },
    applicantName: { type: String, required: true },
    bankName: { type: String, required: true },
    productType: { type: String, required: true }, // HL, LAP, PL, BL, etc.
    loanAmount: { type: Number, required: true }, // Disbursed Amount
    payoutPercentage: { type: Number, required: true }, // Commission %
    payoutAmount: { type: Number, required: true }, // Net Commission Paid
    disbursedDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Paid'], 
        default: 'Paid' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);