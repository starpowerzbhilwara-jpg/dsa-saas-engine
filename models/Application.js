const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    location: { type: String, default: 'General' },
    bankName: { type: String, required: true },
    loanAmount: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['Logged In', 'Underwriting', 'Sanctioned', 'Disbursed', 'Rejected'], 
        default: 'Logged In' 
    },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned Calling Staff
    
    payouts: {
        masterPayout: { type: Number, default: 0 },
        agentPayout: { type: Number, default: 0 },
        callerPayout: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);