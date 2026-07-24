const mongoose = require('mongoose');

const bankConfigSchema = new mongoose.Schema({
    bankName: { type: String, required: true }, // e.g., HDFC, ICICI, SBI
    portalUrl: { type: String },
    loginId: { type: String, required: true },
    password: { type: String, required: true },
    
    // Location wise Sales Managers
    salesManagers: [{
        location: { type: String, required: true }, // e.g., Bhilwara, Jaipur
        smName: { type: String, required: true },
        smPhone: { type: String, required: true },
        smEmail: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('BankConfig', bankConfigSchema);