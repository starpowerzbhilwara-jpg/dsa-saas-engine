const mongoose = require('mongoose');

// Dynamic Module Configuration
const customModuleSchema = new mongoose.Schema({
    moduleName: { type: String, required: true, unique: true }, // e.g., 'sub_dsa', 'leads', 'payout_rules'
    fields: [{
        fieldName: { type: String, required: true }, // e.g., 'aadharNumber'
        fieldLabel: { type: String, required: true }, // e.g., 'Aadhar Number'
        fieldType: { type: String, default: 'text' },  // 'text', 'number', 'select', 'date'
        isRequired: { type: Boolean, default: false }
    }]
}, { timestamps: true });

// Dynamic Data Store (Generically handles all dynamic module data)
const customDataSchema = new mongoose.Schema({
    moduleName: { type: String, required: true, index: true },
    data: { type: Object, required: true } // Dynamic JSON Object
}, { timestamps: true, strict: false });

const CustomModule = mongoose.model('CustomModule', customModuleSchema);
const CustomData = mongoose.model('CustomData', customDataSchema);

module.exports = { CustomModule, CustomData };