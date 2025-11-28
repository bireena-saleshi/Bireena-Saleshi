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
    // 🎯 PRICING FIELDS - Purchase vs Selling Price
    price: {
        type: Number,
        required: true,
        min: 0
    },
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
    // 🎯 STOCK MANAGEMENT
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
    // 🎯 EXPIRY TRACKING
    mfgDate: {
        type: Date,
        default: null
    },
    expiryDate: {
        type: Date,
        default: null
    },
    // 🎯 SUPPLIER/VENDOR MANAGEMENT
    supplierName: {
        type: String,
        default: ''
    },
    supplierContact: {
        type: String,
        default: ''
    },
    lastPurchasedDate: {
        type: Date,
        default: null
    },
    // 🎯 BATCH MANAGEMENT
    batchNumber: {
        type: String,
        default: ''
    },
    // 🎯 MULTI-BRANCH SUPPORT
    branch: {
        type: String,
        default: 'Main Branch'
    },
    description: {
        type: String,
        default: ''
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

// Update timestamp on save
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
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

// 🎯 Virtual for profit calculations
productSchema.virtual('profitPerItem').get(function() {
    return (this.sellingPrice || this.price) - (this.purchasePrice || 0);
});

productSchema.virtual('totalProfit').get(function() {
    return this.profitPerItem * this.stock;
});

// 🎯 Virtual for expiry status
productSchema.virtual('expiryStatus').get(function() {
    if (!this.expiryDate) return 'N/A';
    
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 30) return 'Expiring Soon';
    return 'Fresh';
});

productSchema.virtual('daysUntilExpiry').get(function() {
    if (!this.expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
});

// Enable virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
