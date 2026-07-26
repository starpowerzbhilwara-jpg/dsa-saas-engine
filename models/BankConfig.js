const mongoose = require('mongoose');

const bankConfigSchema = new mongoose.Schema({
    bankName: { 
        type: String, 
        required: [true, 'Bank name is required'],
        trim: true 
    },
    code: {
        type: String,
        default: '',
        trim: true
    },
    minSalary: { 
        type: Number, 
        default: 15000 
    },
    foirPercent: { 
        type: Number, 
        default: 50 
    },
    minCibil: { 
        type: Number, 
        default: 650 
    },
    maxBouncingAllowed: { 
        type: Number, 
        default: 2 
    },
    interestRate: { 
        type: Number, 
        default: 10.5 
    },
    maxTenureMonths: { 
        type: Number, 
        default: 60 
    },
    payoutPercentage: { 
        type: Number, 
        default: 1.5 // DSA Commission % for this bank
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

bankConfigSchema.index({ bankName: 1 });
bankConfigSchema.index({ isActive: 1 });

module.exports = mongoose.model('BankConfig', bankConfigSchema);