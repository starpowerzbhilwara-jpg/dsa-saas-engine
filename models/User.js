const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'] 
    },
    phone: { 
        type: String, 
        required: [true, 'Phone is required'],
        trim: true 
    },
    role: { 
        type: String, 
        enum: ['ADMIN', 'DSA', 'CALLER', 'CUSTOMER'], 
        default: 'DSA' 
    },
    dsaCode: { 
        type: String, 
        default: function() {
            return 'DSA-' + Math.floor(100000 + Math.random() * 900000);
        },
        unique: true 
    },
    payoutPercentage: { 
        type: Number, 
        default: 1.0 // Default commission % for this DSA/Agent
    },
    totalEarnings: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

userSchema.index({ email: 1 });
userSchema.index({ dsaCode: 1 });

module.exports = mongoose.model('User', userSchema);