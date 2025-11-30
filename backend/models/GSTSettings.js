const mongoose = require('mongoose');

const gstSettingsSchema = new mongoose.Schema({
    // Business Details
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    gstin: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
    },
    stateCode: {
        type: String,
        required: true,
        trim: true
    },
    stateName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    
    // Default GST Rates (can be overridden per product)
    defaultCGSTRate: {
        type: Number,
        default: 2.5,
        min: 0,
        max: 14
    },
    defaultSGSTRate: {
        type: Number,
        default: 2.5,
        min: 0,
        max: 14
    },
    defaultIGSTRate: {
        type: Number,
        default: 5,
        min: 0,
        max: 28
    },
    
    // GST Configuration
    enableGST: {
        type: Boolean,
        default: true
    },
    gstIncludedInPrice: {
        type: Boolean,
        default: true
    },
    
    // Default HSN Code for bakery products
    defaultHSNCode: {
        type: String,
        default: '19059020',
        trim: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Only one settings document should exist
gstSettingsSchema.index({ _id: 1 }, { unique: true });

// Update timestamp before save
gstSettingsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('GSTSettings', gstSettingsSchema);
