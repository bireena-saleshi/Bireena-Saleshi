const mongoose = require('mongoose');

/**
 * 🎯 STOCK TRANSFER MODEL
 * Tracks inventory transfers between branches
 */
const stockTransferSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    sourceBranch: {
        type: String,
        required: true
    },
    destinationBranch: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Transit', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        default: ''
    },
    transferDate: {
        type: Date,
        default: Date.now
    },
    completedDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
stockTransferSchema.index({ productId: 1 });
stockTransferSchema.index({ sourceBranch: 1 });
stockTransferSchema.index({ destinationBranch: 1 });
stockTransferSchema.index({ status: 1 });
stockTransferSchema.index({ transferDate: -1 });

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
