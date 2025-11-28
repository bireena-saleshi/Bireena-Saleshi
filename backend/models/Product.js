const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        default: 'piece',
        enum: ['piece', 'kg', 'dozen', 'box']
    },
    reorderLevel: {
        type: Number,
        default: 10,
        min: 0
    },
    description: {
        type: String,
        default: ''
    },
    // 🎯 EXPIRY TRACKING FIELDS
    mfgDate: {
        type: Date,
        default: null
    },
    expiryDate: {
        type: Date,
        default: null
    },
    expirySoon: {
        type: Boolean,
        default: false
    },
    // 🎯 ENHANCED FIELDS
    purchasePrice: {
        type: Number,
        default: 0,
        min: 0
    },
    sellingPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    supplierName: {
        type: String,
        default: ''
    },
    supplierContact: {
        type: String,
        default: ''
    },
    batchNumber: {
        type: String,
        default: ''
    },
    branch: {
        type: String,
        default: 'Main Branch'
    },
    lastPurchasedDate: {
        type: Date,
        default: null
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

// Update timestamp and expiry status on save
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // 🎯 AUTO-CALCULATE EXPIRY STATUS
    if (this.expiryDate) {
        const today = new Date();
        const expiry = new Date(this.expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        // Mark as expirySoon if within 30 days (including 0 days)
        this.expirySoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    } else {
        this.expirySoon = false;
    }
    
    next();
});

// Indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for low stock check
productSchema.virtual('isLowStock').get(function() {
    return this.stock <= this.reorderLevel;
});

module.exports = mongoose.model('Product', productSchema);
