const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'DSA', 'Calling Staff', 'Customer'], 
        default: 'DSA' 
    },
    // Auto-Generated Unique DSA Code (e.g. DSA101, DSA102)
    dsaCode: { type: String, unique: true, sparse: true },
    phone: { type: String, default: '' },
    city: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);