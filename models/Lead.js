const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    applicantName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    city: { type: String, required: true },
    loanProduct: { type: String, required: true }, // PL, HL, LAP, BL
    monthlyIncome: { type: Number, required: true },
    existingEmi: { type: Number, default: 0 },
    bouncingCount: { type: Number, default: 0 },
    requestedAmount: { type: Number, required: true },
    
    // Uploaded Documents Tracking
    documents: {
        panCard: { type: String, default: '' },
        aadhaarCard: { type: String, default: '' },
        bankStatement: { type: String, default: '' },
        salarySlip: { type: String, default: '' }
    },

    // CAM Engine Outputs
    camCalculated: {
        foirLimit: { type: Number, default: 50 },
        maxEmiAllowed: { type: Number, default: 0 },
        approvedAmount: { type: Number, default: 0 },
        abbAmount: { type: Number, default: 0 },
        status: { type: String, enum: ['Eligible', 'Rejected'], default: 'Eligible' },
        rejectionReason: { type: String, default: '' }
    },

    // Dynamically Filtered Eligible Banks for this File
    eligibleBankIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BankConfig' }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);