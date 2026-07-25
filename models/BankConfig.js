const mongoose = require('mongoose');

const bankConfigSchema = new mongoose.Schema({
    bankName: { type: String, required: true },
    portalType: { 
        type: String, 
        enum: ['Direct Portal', 'UTM Link', 'Partner Login'], 
        default: 'UTM Link' 
    },
    portalUrl: { type: String, required: true },
    userId: { type: String, default: '' },
    password: { type: String, default: '' },
    payoutPercentage: { type: Number, default: 0 },
    productsSupported: [{ type: String }], // e.g. ['HL', 'LAP', 'PL', 'BL']
    adminOtpPhone: { type: String, default: '+91-9876543210' }, // Mobile number shown for OTP assistance
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BankConfig', bankConfigSchema);