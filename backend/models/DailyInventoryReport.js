const mongoose = require('mongoose');

const dailyInventoryReportSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    openingStock: {
        type: Number,
        required: true,
        default: 0
    },
    additions: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    damage: {
        type: Number,
        default: 0
    },
    closingStock: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    branch: {
        type: String,
        default: 'Main Branch'
    }
}, {
    timestamps: true
});

// Compound index for unique daily product records per branch
dailyInventoryReportSchema.index({ date: 1, productId: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('DailyInventoryReport', dailyInventoryReportSchema);
