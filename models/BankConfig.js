const mongoose = require('mongoose');

const bankConfigSchema = new mongoose.Schema({
    bankName: { 
        type: String, 
        required: [true, 'Bank Name is required'], 
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
    allowedStates: [{ 
        type: String, 
        default: 'ALL' // Pan India support
    }],
    utmLink: { 
        type: String, 
        required: [true, 'Bank/NBFC Direct UTM Login Link is required'],
        trim: true 
    },
    payoutPercentage: { 
        type: Number, 
        default: 2.0 // Admin commission percentage from Bank
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('BankConfig', bankConfigSchema);