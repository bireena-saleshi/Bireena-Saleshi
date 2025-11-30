const mongoose = require('mongoose');

/**
 * 🎯 BATCH MODEL
 * Supports multiple batches per product
 * Each batch has its own MFG, Expiry, and Stock
 */
const batchSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    batchNumber: {
        type: String,
        required: true,
        trim: true
    },
    mfgDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    supplierName: {
        type: String,
        default: ''
    },
    supplierContact: {
        type: String,
        default: ''
    },
    branch: {
        type: String,
        default: 'Main Branch'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Virtual for expiry status
batchSchema.virtual('expiryStatus').get(function() {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 30) return 'Expiring Soon';
    return 'Fresh';
});

batchSchema.virtual('daysUntilExpiry').get(function() {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
});

// Indexes
batchSchema.index({ productId: 1 });
batchSchema.index({ batchNumber: 1 });
batchSchema.index({ expiryDate: 1 });

// Enable virtuals
batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Batch', batchSchema);
