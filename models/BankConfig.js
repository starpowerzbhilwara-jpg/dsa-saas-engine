const mongoose = require('mongoose');

const bankConfigSchema = new mongoose.Schema({
    bankName: { type: String, required: true },
    logoUrl: { type: String },
    portalUrl: { type: String },
    minSalary: { type: Number, default: 15000 },
    minCibil: { type: Number, default: 650 },
    allowedFOIR: { type: Number, default: 50 }, // Percentage FOIR
    supportedStatementTypes: [{ type: String }], // PDF, Netbanking, Excel
    isPerfuseSupported: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BankConfig', bankConfigSchema);