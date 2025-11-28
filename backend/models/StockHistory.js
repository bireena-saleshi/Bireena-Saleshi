const mongoose = require('mongoose');

/**
 * 🎯 STOCK HISTORY MODEL
 * Tracks all inventory changes and actions
 * Used for audit trail and activity logs
 */
const stockHistorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'PRODUCT_ADDED',
            'PRODUCT_EDITED',
            'STOCK_INCREASED',
            'STOCK_DECREASED',
            'DAMAGE_ENTRY',
            'PRODUCT_DELETED',
            'STOCK_TRANSFER_OUT',
            'STOCK_TRANSFER_IN',
            'SALE_MADE'
        ]
    },
    oldValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    quantityChanged: {
        type: Number,
        default: 0
    },
    reason: {
        type: String,
        default: ''
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    performedByName: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        default: 'Main Branch'
    },
    supplierName: {
        type: String,
        default: ''
    },
    supplierContact: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
stockHistorySchema.index({ productId: 1 });
stockHistorySchema.index({ action: 1 });
stockHistorySchema.index({ performedBy: 1 });
stockHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockHistory', stockHistorySchema);
