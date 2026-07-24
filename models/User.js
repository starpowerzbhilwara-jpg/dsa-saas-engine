const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    phone: { type: String },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['MASTER', 'Admin', 'DSA', 'Sub-DSA', 'Agent', 'Telecaller', 'Customer'], 
        default: 'Agent' 
    },
    city: { type: String },
    state: { type: String },
    agentCode: { type: String }, 
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Ye line sirf ek hi baar honi chahiye poori file me
module.exports = mongoose.models.User || mongoose.model('User', userSchema);