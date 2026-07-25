const mongoose = require('mongoose');

const salesManagerSchema = new mongoose.Schema({
    state: { type: String, required: true },
    city: { type: String, required: true },
    smName: { type: String, required: true },
    email: { type: String, default: '' },
    mobile: { type: String, required: true },
    post: { type: String, default: 'Sales Manager' }, // e.g. ASM, RSM, SM
    product: { type: String, default: 'All' } // e.g. HL, LAP, PL, BL
}, { timestamps: true });

module.exports = mongoose.model('SalesManager', salesManagerSchema);