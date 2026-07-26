const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    dsaCode: { 
        type: String, 
        default: 'DIRECT',
        trim: true 
    },
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
    customFields: { type: Object, default: {} }, 

    // CAM Engine Outputs
    camCalculated: {
        foirLimit: { type: Number, default: 50 },
        maxEmiAllowed: { type: Number, default: 0 },
        approvedAmount: { type: Number, default: 0 },
        abbAmount: { type: Number, default: 0 },
        status: { 
            type: String, 
            enum: ['Eligible', 'Rejected', 'Pending', 'In Review', 'eligible', 'rejected'], 
            default: 'Eligible' 
        },
        rejectionReason: { type: String, default: '' }
    },

    // Reference to Bank Config Collection
    eligibleBankIds: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BankConfig' 
    }]
}, { 
    timestamps: true, // Automatically manages createdAt and updatedAt
    strict: false     // Allows storing dynamic payload fields if needed
});

// Performance Index for MongoDB Atlas queries (Dashboard/Board speed increases)
leadSchema.index({ createdAt: -1 });
leadSchema.index({ dsaCode: 1 });

module.exports = mongoose.model('Lead', leadSchema);