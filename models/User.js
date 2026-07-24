const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['MASTER', 'DSA_AGENT', 'CALLING_STAFF'], 
        default: 'DSA_AGENT' 
    },
    phone: { type: String },
    panCard: { type: String },
    location: { type: String, default: 'All' }, // E.g., Jaipur, Bhilwara, Delhi
    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String }
    },
    utmLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);