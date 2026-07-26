const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    // DSA Details
    dsaCode: { 
        type: String, 
        default: 'DIRECT',
        trim: true 
    },
    
    // Who created or submitted this lead
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Source Tracking: 'Customer (Online)', 'DSA Agent', 'Admin / Staff'
    source: {
        type: String,
        enum: ['Customer (Online)', 'DSA Agent', 'Admin / Staff'],
        default: 'Customer (Online)'
    },

    // Applicant Details
    applicantName: { 
        type: String, 
        required: [true, 'Applicant name is required'],
        trim: true 
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'],
        trim: true 
    },
    city: { 
        type: String, 
        default: '',
        trim: true 
    },
    loanProduct: { 
        type: String, 
        default: 'Personal Loan',
        trim: true 
    },
    monthlyIncome: { type: Number, default: 0 },
    existingEmi: { type: Number, default: 0 },
    bouncingCount: { type: Number, default: 0 },
    requestedAmount: { type: Number, default: 0 },
    
    // Dynamic / Extra Form Fields
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} }, 

    // CAM Engine Outputs
    camCalculated: {
        foirLimit: { type: Number, default: 50 },
        maxEmiAllowed: { type: Number, default: 0 },
        approvedAmount: { type: Number, default: 0 },
        abbAmount: { type: Number, default: 0 },
        status: { 
            type: String, 
            enum: ['Eligible', 'Rejected', 'Pending', 'In Review'], 
            default: 'Eligible' 
        },
        rejectionReason: { type: String, default: '' }
    },

    // Bank Reference
    eligibleBankIds: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BankConfig' 
    }]
}, { 
    timestamps: true,
    strict: false 
});

// Atlas Indexes
leadSchema.index({ createdAt: -1 });
leadSchema.index({ dsaCode: 1 });
leadSchema.index({ source: 1 });

module.exports = mongoose.model('Lead', leadSchema);