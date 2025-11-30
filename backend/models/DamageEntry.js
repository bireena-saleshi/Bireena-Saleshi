const mongoose = require('mongoose');

/**
 * 🎯 DAMAGE ENTRY MODEL
 * Tracks damaged/wasted products
 * Does NOT count in sales revenue
 */
const damageEntrySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    damagedQuantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        default: 'piece'
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'Expired',
            'Damaged in Transport',
            'Quality Issue',
            'Burnt',
            'Spoiled',
            'Broken',
            'Customer Return',
            'Other'
        ]
    },
    reasonDetails: {
        type: String,
        default: ''
    },
    estimatedLoss: {
        type: Number,
        default: 0
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedByName: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        default: 'Main Branch'
    },
    damageDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
damageEntrySchema.index({ productId: 1 });
damageEntrySchema.index({ reason: 1 });
damageEntrySchema.index({ damageDate: -1 });
damageEntrySchema.index({ reportedBy: 1 });

module.exports = mongoose.model('DamageEntry', damageEntrySchema);
