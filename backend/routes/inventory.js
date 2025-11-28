const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const DamageEntry = require('../models/DamageEntry');
const StockTransfer = require('../models/StockTransfer');
const User = require('../models/User');

// 🎯 View all products with advanced filtering
router.get('/', isAuthenticated, async (req, res) => {
    try {
        let filter = {};
        const { expiryFilter, stockFilter, branch } = req.query;
        
        // If user is employee (staff), only show products from their branch
        if (req.session.user.role === 'staff') {
            filter.addedBy = req.session.user.id;
        }
        
        // Branch filter for admin
        if (req.session.user.role === 'admin' && branch) {
            filter.branch = branch;
        }
        
        const products = await Product.find(filter)
            .populate('addedBy', 'fullName username')
            .populate('updatedBy', 'fullName username')
            .sort({ name: 1 });
        
        // Apply expiry filters
        let filteredProducts = products;
        if (expiryFilter) {
            const today = new Date();
            filteredProducts = products.filter(product => {
                if (!product.expiryDate) return expiryFilter === 'no-expiry';
                
                const expiry = new Date(product.expiryDate);
                const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                
                if (expiryFilter === 'expired') return daysUntilExpiry < 0;
                if (expiryFilter === 'soon') return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
                if (expiryFilter === 'fresh') return daysUntilExpiry > 30;
                return true;
            });
        }
        
        // Apply stock filters
        if (stockFilter === 'low') {
            filteredProducts = filteredProducts.filter(p => p.stock <= p.reorderLevel);
        } else if (stockFilter === 'out') {
            filteredProducts = filteredProducts.filter(p => p.stock === 0);
        }
        
        // Calculate statistics
        const expiringCount = products.filter(p => {
            if (!p.expiryDate) return false;
            const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 30;
        }).length;
        
        const expiredCount = products.filter(p => {
            if (!p.expiryDate) return false;
            return new Date(p.expiryDate) < new Date();
        }).length;
        
        // Get all branches for admin filter (from both products and employees)
        let branches = [];
        if (req.session.user.role === 'admin') {
            // Get all employees with their branches
            const employees = await User.find({ role: 'staff' }).select('branch fullName');
            const employeeBranches = employees.map(emp => emp.branch).filter(b => b);
            // Get branches from all products
            const productBranches = await Product.distinct('branch');
            // Combine and remove duplicates, filter out null/empty, and sort
            const allBranches = [...new Set([...employeeBranches, ...productBranches])];
            branches = allBranches.filter(b => b && b.trim() !== '').sort();
        }
        
        res.render('inventory/list', { 
            products: filteredProducts,
            allProducts: products,
            expiringCount,
            expiredCount,
            filters: { expiryFilter, stockFilter, branch },
            branches,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error('Inventory error:', error);
        req.flash('error_msg', 'Error loading inventory');
        res.redirect('/dashboard');
    }
});

// Add product page
router.get('/add', isAuthenticated, (req, res) => {
    res.render('inventory/add');
});

// Create product with enhanced fields
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { 
            name, category, price, purchasePrice, sellingPrice, stock, unit, reorderLevel, 
            description, mfgDate, expiryDate, supplierName, supplierContact, 
            lastPurchasedDate, batchNumber, branch 
        } = req.body;

        const product = new Product({
            name,
            category,
            price: parseFloat(price),
            purchasePrice: parseFloat(purchasePrice) || 0,
            sellingPrice: parseFloat(sellingPrice) || parseFloat(price),
            stock: parseInt(stock),
            unit,
            reorderLevel: parseInt(reorderLevel || 10),
            description,
            mfgDate: mfgDate || null,
            expiryDate: expiryDate || null,
            supplierName: supplierName || '',
            supplierContact: supplierContact || '',
            lastPurchasedDate: lastPurchasedDate || Date.now(),
            batchNumber: batchNumber || '',
            branch: branch || (req.session.user.role === 'staff' ? req.session.user.branch : 'Admin'),
            addedBy: req.session.user ? req.session.user.id : null
        });

        await product.save();
        
        // Log activity
        await StockHistory.create({
            productId: product._id,
            actionType: 'PRODUCT_ADDED',
            userId: req.session.user.id,
            newValue: stock,
            notes: `Product "${name}" added to inventory`
        });
        
        req.flash('success_msg', 'Product added successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Add product error:', error);
        req.flash('error_msg', 'Error adding product');
        res.redirect('/inventory/add');
    }
});

// Edit product page
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/inventory');
        }
        res.render('inventory/edit', { product });
    } catch (error) {
        console.error('Edit product error:', error);
        req.flash('error_msg', 'Error loading product');
        res.redirect('/inventory');
    }
});

// Update product with enhanced fields
router.post('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const { 
            name, category, price, purchasePrice, sellingPrice, stock, unit, reorderLevel, 
            description, mfgDate, expiryDate, supplierName, supplierContact, 
            lastPurchasedDate, batchNumber, branch 
        } = req.body;

        const oldProduct = await Product.findById(req.params.id);
        
        await Product.findByIdAndUpdate(req.params.id, {
            name,
            category,
            price: parseFloat(price),
            purchasePrice: parseFloat(purchasePrice) || 0,
            sellingPrice: parseFloat(sellingPrice) || parseFloat(price),
            stock: parseInt(stock),
            unit,
            reorderLevel: parseInt(reorderLevel || 10),
            description,
            mfgDate: mfgDate || null,
            expiryDate: expiryDate || null,
            supplierName: supplierName || '',
            supplierContact: supplierContact || '',
            lastPurchasedDate: lastPurchasedDate || null,
            batchNumber: batchNumber || '',
            branch: branch || oldProduct.branch,
            updatedBy: req.session.user ? req.session.user.id : null,
            updatedAt: Date.now()
        });

        // Log activity if stock changed
        if (oldProduct.stock !== parseInt(stock)) {
            await StockHistory.create({
                productId: req.params.id,
                actionType: parseInt(stock) > oldProduct.stock ? 'STOCK_INCREASED' : 'STOCK_DECREASED',
                userId: req.session.user.id,
                oldValue: oldProduct.stock,
                newValue: parseInt(stock),
                notes: `Product "${name}" updated`
            });
        }

        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Update product error:', error);
        req.flash('error_msg', 'Error updating product');
        res.redirect('/inventory');
    }
});

// Delete product with activity log
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (product) {
            // Log deletion
            await StockHistory.create({
                productId: product._id,
                actionType: 'PRODUCT_DELETED',
                userId: req.session.user.id,
                oldValue: product.stock,
                newValue: 0,
                notes: `Product "${product.name}" deleted from inventory`
            });
            
            await Product.findByIdAndDelete(req.params.id);
        }
        
        req.flash('success_msg', 'Product deleted successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Delete product error:', error);
        req.flash('error_msg', 'Error deleting product');
        res.redirect('/inventory');
    }
});

// Low stock alert
router.get('/low-stock', isAuthenticated, async (req, res) => {
    try {
        let filter = {
            $expr: { $lte: ['$stock', '$reorderLevel'] }
        };
        
        // If user is employee (staff), only show products from their branch
        if (req.session.user.role === 'staff') {
            filter.addedBy = req.session.user.id;
        }
        
        const products = await Product.find(filter).sort({ stock: 1 });
        res.render('inventory/low-stock', { products });
    } catch (error) {
        console.error('Low stock error:', error);
        req.flash('error_msg', 'Error loading low stock items');
        res.redirect('/inventory');
    }
});

// 🎯 Activity Log
router.get('/activity-log', isAuthenticated, async (req, res) => {
    try {
        const { productId, actionType, startDate, endDate } = req.query;
        let filter = {};
        
        if (productId) filter.productId = productId;
        if (actionType) filter.actionType = actionType;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }
        
        const activities = await StockHistory.find(filter)
            .populate('productId', 'name category')
            .populate('userId', 'fullName username')
            .sort({ timestamp: -1 })
            .limit(100);
            
        const products = await Product.find().select('name').sort({ name: 1 });
        
        res.render('inventory/activity-log', { activities, products, filters: req.query });
    } catch (error) {
        console.error('Activity log error:', error);
        req.flash('error_msg', 'Error loading activity log');
        res.redirect('/inventory');
    }
});

// 🎯 Damage Entry Page
router.get('/damage/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/inventory');
        }
        res.render('inventory/damage-entry', { product });
    } catch (error) {
        console.error('Damage entry error:', error);
        req.flash('error_msg', 'Error loading damage entry');
        res.redirect('/inventory');
    }
});

// 🎯 Record Damage
router.post('/damage/:id', isAuthenticated, async (req, res) => {
    try {
        const { damagedQuantity, reason, notes } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/inventory');
        }
        
        const quantity = parseInt(damagedQuantity);
        if (quantity > product.stock) {
            req.flash('error_msg', 'Damaged quantity cannot exceed available stock');
            return res.redirect(`/inventory/damage/${req.params.id}`);
        }
        
        // Record damage entry
        const damageEntry = new DamageEntry({
            productId: req.params.id,
            damagedQuantity: quantity,
            reason,
            notes,
            estimatedLoss: (product.purchasePrice || product.price) * quantity,
            reportedBy: req.session.user.id
        });
        await damageEntry.save();
        
        // Update stock
        product.stock -= quantity;
        await product.save();
        
        // Log activity
        await StockHistory.create({
            productId: req.params.id,
            actionType: 'DAMAGE_ENTRY',
            userId: req.session.user.id,
            oldValue: product.stock + quantity,
            newValue: product.stock,
            notes: `Damaged: ${reason}`
        });
        
        req.flash('success_msg', 'Damage recorded successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Record damage error:', error);
        req.flash('error_msg', 'Error recording damage');
        res.redirect('/inventory');
    }
});

// 🎯 Damage Report
router.get('/damage-report', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.query;
        let filter = {};
        
        if (startDate || endDate) {
            filter.reportedAt = {};
            if (startDate) filter.reportedAt.$gte = new Date(startDate);
            if (endDate) filter.reportedAt.$lte = new Date(endDate);
        }
        if (reason) filter.reason = reason;
        
        const damages = await DamageEntry.find(filter)
            .populate('productId', 'name category')
            .populate('reportedBy', 'fullName username')
            .sort({ reportedAt: -1 });
            
        const totalLoss = damages.reduce((sum, d) => sum + d.estimatedLoss, 0);
        const totalItems = damages.reduce((sum, d) => sum + d.damagedQuantity, 0);
        
        res.render('inventory/damage-report', { 
            damages, 
            totalLoss, 
            totalItems,
            filters: req.query 
        });
    } catch (error) {
        console.error('Damage report error:', error);
        req.flash('error_msg', 'Error loading damage report');
        res.redirect('/inventory');
    }
});

// 🎯 Expiring Soon
router.get('/expiring-soon', isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const products = await Product.find({
            expiryDate: { $gte: today, $lte: thirtyDaysLater }
        }).sort({ expiryDate: 1 });
        
        res.render('inventory/expiring-soon', { products });
    } catch (error) {
        console.error('Expiring soon error:', error);
        req.flash('error_msg', 'Error loading expiring products');
        res.redirect('/inventory');
    }
});

// 🎯 Expired Products
router.get('/expired', isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        const products = await Product.find({
            expiryDate: { $lt: today }
        }).sort({ expiryDate: 1 });
        
        res.render('inventory/expired', { products });
    } catch (error) {
        console.error('Expired products error:', error);
        req.flash('error_msg', 'Error loading expired products');
        res.redirect('/inventory');
    }
});

// 🎯 Stock Transfer Page (Admin Only)
router.get('/transfer', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const products = await Product.find().select('name stock branch').sort({ name: 1 });
        const employees = await User.find({ role: 'staff' }).select('branch fullName');
        const branches = [...new Set(employees.map(e => e.branch).filter(b => b))];
        
        res.render('inventory/stock-transfer', { products, branches });
    } catch (error) {
        console.error('Stock transfer error:', error);
        req.flash('error_msg', 'Error loading stock transfer');
        res.redirect('/inventory');
    }
});

// 🎯 Process Stock Transfer (Admin Only)
router.post('/transfer', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { productId, quantity, sourceBranch, destinationBranch } = req.body;
        
        if (sourceBranch === destinationBranch) {
            req.flash('error_msg', 'Source and destination branches cannot be the same');
            return res.redirect('/inventory/transfer');
        }
        
        const sourceProduct = await Product.findOne({ _id: productId, branch: sourceBranch });
        if (!sourceProduct || sourceProduct.stock < parseInt(quantity)) {
            req.flash('error_msg', 'Insufficient stock in source branch');
            return res.redirect('/inventory/transfer');
        }
        
        // Decrease source stock
        sourceProduct.stock -= parseInt(quantity);
        await sourceProduct.save();
        
        // Log transfer out
        await StockHistory.create({
            productId: sourceProduct._id,
            actionType: 'STOCK_TRANSFER_OUT',
            userId: req.session.user.id,
            oldValue: sourceProduct.stock + parseInt(quantity),
            newValue: sourceProduct.stock,
            notes: `Transferred ${quantity} to ${destinationBranch}`
        });
        
        // Increase destination stock or create new product
        let destProduct = await Product.findOne({ name: sourceProduct.name, branch: destinationBranch });
        if (destProduct) {
            destProduct.stock += parseInt(quantity);
            await destProduct.save();
        } else {
            destProduct = new Product({
                ...sourceProduct.toObject(),
                _id: undefined,
                stock: parseInt(quantity),
                branch: destinationBranch,
                addedBy: req.session.user.id
            });
            await destProduct.save();
        }
        
        // Log transfer in
        await StockHistory.create({
            productId: destProduct._id,
            actionType: 'STOCK_TRANSFER_IN',
            userId: req.session.user.id,
            oldValue: destProduct.stock - parseInt(quantity),
            newValue: destProduct.stock,
            notes: `Received ${quantity} from ${sourceBranch}`
        });
        
        // Record transfer
        await StockTransfer.create({
            productId: sourceProduct._id,
            quantity: parseInt(quantity),
            sourceBranch,
            destinationBranch,
            transferredBy: req.session.user.id,
            status: 'Completed'
        });
        
        req.flash('success_msg', 'Stock transferred successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Transfer stock error:', error);
        req.flash('error_msg', 'Error transferring stock');
        res.redirect('/inventory/transfer');
    }
});

module.exports = router;
