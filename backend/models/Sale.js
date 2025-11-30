const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    itemDiscount: {
        type: Number,
        default: 0
    },
    itemDiscountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed'
    },
    itemDiscountValue: {
        type: Number,
        default: 0
    }
});

const saleSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [saleItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed'
    },
    total: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    dueAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'partial', 'due'],
        default: 'paid'
    },
    customerName: {
        type: String,
        default: 'Walk-in Customer'
    },
    customerPhone: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online'],
        default: 'cash'
    },
    smsSent: {
        type: Boolean,
        default: false
    },
    paymentHistory: [{
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'upi', 'other'],
            default: 'cash'
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    refundAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    refundMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online', 'bank_transfer', 'none'],
        default: 'none'
    },
    refundProcessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    refundNotes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
saleSchema.index({ billNumber: 1 }, { unique: true });
saleSchema.index({ createdBy: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ customerPhone: 1 });
saleSchema.index({ total: 1 });

// Virtual for checking if payment is complete
saleSchema.virtual('isPaid').get(function() {
    return this.paymentStatus === 'paid';
});

module.exports = mongoose.model('Sale', saleSchema);
