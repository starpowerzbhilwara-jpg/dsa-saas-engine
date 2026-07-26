const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    dsaCode: { type: String, default: 'DIRECT' },
    applicantName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String },
    loanProduct: { type: String },
    monthlyIncome: { type: Number, default: 0 },
    existingEmi: { type: Number, default: 0 },
    bouncingCount: { type: Number, default: 0 },
    requestedAmount: { type: Number, default: 0 },
    
    // CAM Engine Outputs
    camCalculated: {
        foirLimit: { type: Number, default: 50 },
        maxEmiAllowed: { type: Number, default: 0 },
        approvedAmount: { type: Number, default: 0 },
        abbAmount: { type: Number, default: 0 },
        status: { type: String, enum: ['Eligible', 'Rejected'], default: 'Eligible' },
        rejectionReason: { type: String, default: '' }
    },
    
    eligibleBankIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BankConfig' }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);