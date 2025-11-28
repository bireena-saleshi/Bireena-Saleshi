const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const DamageEntry = require('../models/DamageEntry');
const Batch = require('../models/Batch');
const StockTransfer = require('../models/StockTransfer');

// 🎯 HELPER FUNCTION - Update expiry status for all products
async function updateExpiryStatus() {
    try {
        const products = await Product.find({ expiryDate: { $exists: true, $ne: null } });
        const today = new Date();
        
        for (const product of products) {
            const expiry = new Date(product.expiryDate);
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            // Update expirySoon status
            const newExpirySoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
            
            if (product.expirySoon !== newExpirySoon) {
                product.expirySoon = newExpirySoon;
                await product.save();
            }
        }
    } catch (error) {
        console.error('Error updating expiry status:', error);
    }
}

// 🎯 View all products with advanced filtering
router.get('/', isAuthenticated, async (req, res) => {
    try {
        // 🎯 UPDATE EXPIRY STATUS ON PAGE LOAD
        await updateExpiryStatus();
        
        const User = require('../models/User');
        let filter = {};
        const { expiryFilter, stockFilter, branch } = req.query;
        
        // If user is employee (staff), only show products from their branch
        if (req.session.user.role === 'staff') {
            filter.addedBy = req.session.user.id;
        }
        
        // Get all products first (for statistics)
        const allProducts = await Product.find(filter)
            .populate('addedBy', 'fullName username')
            .populate('updatedBy', 'fullName username')
            .sort({ name: 1 });
        
        // Apply branch filter AFTER fetching all products
        let products = allProducts;
        if (branch && branch.trim() !== '') {
            products = allProducts.filter(product => {
                const productBranch = product.branch || 'Main Branch';
                return productBranch === branch;
            });
            console.log(`Branch filter: Selected "${branch}" - Found ${products.length} of ${allProducts.length} products`);
        }
        
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
        
        // Calculate statistics (based on all products or branch-filtered)
        const expiringCount = products.filter(p => {
            if (!p.expiryDate) return false;
            const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 30;
        }).length;
        
        const expiredCount = products.filter(p => {
            if (!p.expiryDate) return false;
            return new Date(p.expiryDate) < new Date();
        }).length;
        
        // Get all branches for filter (available to all users)
        let branches = [];
        // Get all employees with their branches
        const employees = await User.find({ role: 'staff' }).select('branch fullName');
        const employeeBranches = employees.map(emp => emp.branch).filter(b => b);
        // Get branches from all products
        const productBranches = await Product.distinct('branch');
        // Combine and remove duplicates, filter out null/empty, and sort
        const allBranches = [...new Set([...employeeBranches, ...productBranches])];
        branches = allBranches.filter(b => b && b.trim() !== '').sort();
        
        console.log('Available branches:', branches);
        
        res.render('inventory/list', { 
            products: filteredProducts,
            allProducts: allProducts,
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
    res.render('inventory/add', {
        user: req.session.user
    });
});

// 🎯 Create product with enhanced fields
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { 
            name, category, price, purchasePrice, sellingPrice, stock, unit, 
            reorderLevel, description, mfgDate, expiryDate, supplierName, 
            supplierContact, batchNumber, branch 
        } = req.body;

        // 🎯 Calculate expirySoon status
        let expirySoon = false;
        if (expiryDate) {
            const today = new Date();
            const expiry = new Date(expiryDate);
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            expirySoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        }

        const product = new Product({
            name,
            category,
            price: parseFloat(price || sellingPrice || 0),
            purchasePrice: parseFloat(purchasePrice || 0),
            sellingPrice: parseFloat(sellingPrice || price || 0),
            stock: parseInt(stock || 0),
            unit,
            reorderLevel: parseInt(reorderLevel || 10),
            description,
            mfgDate: mfgDate || null,
            expiryDate: expiryDate || null,
            expirySoon: expirySoon,
            supplierName: supplierName || '',
            supplierContact: supplierContact || '',
            lastPurchasedDate: new Date(),
            batchNumber: batchNumber || '',
            branch: branch || 'Main Branch',
            addedBy: req.session.user ? req.session.user.id : null
        });

        await product.save();
        
        // 🎯 Log activity to Stock History
        const stockHistory = new StockHistory({
            productId: product._id,
            productName: product.name,
            action: 'PRODUCT_ADDED',
            newValue: {
                stock: product.stock,
                price: product.price,
                purchasePrice: product.purchasePrice,
                sellingPrice: product.sellingPrice
            },
            quantityChanged: product.stock,
            performedBy: req.session.user.id,
            performedByName: req.session.user.fullName || req.session.user.username,
            branch: product.branch,
            supplierName: product.supplierName || '',
            supplierContact: product.supplierContact || ''
        });
        await stockHistory.save();
        
        console.log(`[INVENTORY] User: ${req.session.user.username} added product: ${name}`);
        
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
        res.render('inventory/edit', { 
            product,
            user: req.session.user
        });
    } catch (error) {
        console.error('Edit product error:', error);
        req.flash('error_msg', 'Error loading product');
        res.redirect('/inventory');
    }
});

// 🎯 Update product with enhanced tracking
router.post('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const { 
            name, category, price, purchasePrice, sellingPrice, stock, unit, 
            reorderLevel, description, mfgDate, expiryDate, supplierName, 
            supplierContact, batchNumber, branch 
        } = req.body;

        const oldProduct = await Product.findById(req.params.id);
        
        // 🎯 Calculate expirySoon status
        let expirySoon = false;
        if (expiryDate) {
            const today = new Date();
            const expiry = new Date(expiryDate);
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            expirySoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            name,
            category,
            price: parseFloat(price || sellingPrice || 0),
            purchasePrice: parseFloat(purchasePrice || 0),
            sellingPrice: parseFloat(sellingPrice || price || 0),
            stock: parseInt(stock || 0),
            unit,
            reorderLevel: parseInt(reorderLevel || 10),
            description,
            mfgDate: mfgDate || null,
            expiryDate: expiryDate || null,
            expirySoon: expirySoon,
            supplierName: supplierName || '',
            supplierContact: supplierContact || '',
            batchNumber: batchNumber || '',
            branch: branch || 'Main Branch',
            updatedBy: req.session.user ? req.session.user.id : null,
            updatedAt: Date.now()
        }, { new: true });

        // 🎯 Log activity to Stock History
        const stockHistory = new StockHistory({
            productId: oldProduct._id,
            productName: oldProduct.name,
            action: 'PRODUCT_EDITED',
            oldValue: {
                stock: oldProduct.stock,
                price: oldProduct.price,
                purchasePrice: oldProduct.purchasePrice,
                sellingPrice: oldProduct.sellingPrice
            },
            newValue: {
                stock: updatedProduct.stock,
                price: updatedProduct.price,
                purchasePrice: updatedProduct.purchasePrice,
                sellingPrice: updatedProduct.sellingPrice
            },
            quantityChanged: updatedProduct.stock - oldProduct.stock,
            performedBy: req.session.user.id,
            performedByName: req.session.user.fullName || req.session.user.username,
            branch: updatedProduct.branch
        });
        await stockHistory.save();

        console.log(`[INVENTORY] User: ${req.session.user.username} updated product: ${name}`);

        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Update product error:', error);
        req.flash('error_msg', 'Error updating product');
        res.redirect('/inventory');
    }
});

// 🎯 Delete product with logging
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        // Log activity before deletion
        const stockHistory = new StockHistory({
            productId: product._id,
            productName: product.name,
            action: 'PRODUCT_DELETED',
            oldValue: {
                stock: product.stock,
                price: product.price
            },
            performedBy: req.session.user.id,
            performedByName: req.session.user.fullName || req.session.user.username,
            branch: product.branch || 'Main Branch'
        });
        await stockHistory.save();
        
        await Product.findByIdAndDelete(req.params.id);
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

// 🎯 DAMAGE ENTRY - View damage page for a product
router.get('/damage/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/inventory');
        }
        res.render('inventory/damage-entry', { product });
    } catch (error) {
        console.error('Damage entry page error:', error);
        req.flash('error_msg', 'Error loading damage entry page');
        res.redirect('/inventory');
    }
});

// 🎯 DAMAGE ENTRY - Submit damage entry
router.post('/damage/:id', isAuthenticated, async (req, res) => {
    try {
        const { damagedQuantity, reason, reasonDetails } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/inventory');
        }
        
        const quantity = parseInt(damagedQuantity);
        
        if (quantity > product.stock) {
            req.flash('error_msg', 'Damaged quantity cannot exceed current stock');
            return res.redirect(`/inventory/damage/${req.params.id}`);
        }
        
        // Calculate estimated loss
        const estimatedLoss = quantity * (product.purchasePrice || product.price || 0);
        
        // Create damage entry
        const damageEntry = new DamageEntry({
            productId: product._id,
            productName: product.name,
            damagedQuantity: quantity,
            unit: product.unit,
            reason,
            reasonDetails: reasonDetails || '',
            estimatedLoss,
            reportedBy: req.session.user.id,
            reportedByName: req.session.user.fullName || req.session.user.username,
            branch: product.branch || 'Main Branch'
        });
        await damageEntry.save();
        
        // Reduce stock
        product.stock -= quantity;
        await product.save();
        
        // Log to stock history
        const stockHistory = new StockHistory({
            productId: product._id,
            productName: product.name,
            action: 'DAMAGE_ENTRY',
            oldValue: { stock: product.stock + quantity },
            newValue: { stock: product.stock },
            quantityChanged: -quantity,
            reason: `${reason}: ${reasonDetails}`,
            performedBy: req.session.user.id,
            performedByName: req.session.user.fullName || req.session.user.username,
            branch: product.branch || 'Main Branch'
        });
        await stockHistory.save();
        
        req.flash('success_msg', `Damage entry recorded. Stock reduced by ${quantity} ${product.unit}`);
        res.redirect('/inventory');
    } catch (error) {
        console.error('Damage entry error:', error);
        req.flash('error_msg', 'Error recording damage entry');
        res.redirect('/inventory');
    }
});

// 🎯 DAMAGE REPORT - View all damage entries
router.get('/damage-report', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.query;
        let filter = {};
        
        if (startDate && endDate) {
            filter.damageDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (reason && reason !== 'all') {
            filter.reason = reason;
        }
        
        const damageEntries = await DamageEntry.find(filter)
            .populate('productId', 'name category')
            .populate('reportedBy', 'fullName username')
            .sort({ damageDate: -1 });
        
        // Calculate total loss
        const totalLoss = damageEntries.reduce((sum, entry) => sum + entry.estimatedLoss, 0);
        
        res.render('inventory/damage-report', { 
            damageEntries, 
            totalLoss,
            filters: { startDate, endDate, reason }
        });
    } catch (error) {
        console.error('Damage report error:', error);
        req.flash('error_msg', 'Error loading damage report');
        res.redirect('/inventory');
    }
});

// 🎯 STOCK ACTIVITY LOG - View activity history
router.get('/activity-log', isAuthenticated, async (req, res) => {
    try {
        const { productId, action, startDate, endDate } = req.query;
        let filter = {};
        
        if (productId) {
            filter.productId = productId;
        }
        
        if (action && action !== 'all') {
            filter.action = action;
        }
        
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const activities = await StockHistory.find(filter)
            .populate('productId', 'name category')
            .populate('performedBy', 'fullName username')
            .sort({ createdAt: -1 })
            .limit(200);
        
        const products = await Product.find({}).select('name _id').sort({ name: 1 });
        
        res.render('inventory/activity-log', { 
            activities, 
            products,
            filters: { productId, action, startDate, endDate }
        });
    } catch (error) {
        console.error('Activity log error:', error);
        req.flash('error_msg', 'Error loading activity log');
        res.redirect('/inventory');
    }
});

// 🎯 EXPIRING SOON - View products expiring soon
router.get('/expiring-soon', isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find({ expiryDate: { $exists: true, $ne: null } })
            .populate('addedBy', 'fullName username')
            .sort({ expiryDate: 1 });
        
        const today = new Date();
        const expiringProducts = products.filter(product => {
            const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        });
        
        res.render('inventory/expiring-soon', { products: expiringProducts });
    } catch (error) {
        console.error('Expiring soon error:', error);
        req.flash('error_msg', 'Error loading expiring products');
        res.redirect('/inventory');
    }
});

// 🎯 EXPIRED PRODUCTS - View expired products
router.get('/expired', isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find({ expiryDate: { $exists: true, $ne: null } })
            .populate('addedBy', 'fullName username')
            .sort({ expiryDate: 1 });
        
        const today = new Date();
        const expiredProducts = products.filter(product => {
            return new Date(product.expiryDate) < today;
        });
        
        res.render('inventory/expired', { products: expiredProducts });
    } catch (error) {
        console.error('Expired products error:', error);
        req.flash('error_msg', 'Error loading expired products');
        res.redirect('/inventory');
    }
});

// 🎯 BATCH MANAGEMENT - View batches for a product
router.get('/batches/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const batches = await Batch.find({ productId: req.params.id })
            .populate('addedBy', 'fullName username')
            .sort({ expiryDate: 1 });
        
        res.render('inventory/batches', { product, batches });
    } catch (error) {
        console.error('Batches error:', error);
        req.flash('error_msg', 'Error loading batches');
        res.redirect('/inventory');
    }
});

// 🎯 BATCH MANAGEMENT - Add new batch
router.post('/batches/:id/add', isAuthenticated, async (req, res) => {
    try {
        const { batchNumber, mfgDate, expiryDate, quantity, purchasePrice, sellingPrice, supplierName, supplierContact } = req.body;
        const product = await Product.findById(req.params.id);
        
        const batch = new Batch({
            productId: product._id,
            productName: product.name,
            batchNumber,
            mfgDate,
            expiryDate,
            quantity: parseInt(quantity),
            purchasePrice: parseFloat(purchasePrice || 0),
            sellingPrice: parseFloat(sellingPrice || 0),
            supplierName: supplierName || '',
            supplierContact: supplierContact || '',
            branch: product.branch || 'Main Branch',
            addedBy: req.session.user.id
        });
        await batch.save();
        
        // Update product stock
        product.stock += parseInt(quantity);
        await product.save();
        
        req.flash('success_msg', 'Batch added successfully');
        res.redirect(`/inventory/batches/${req.params.id}`);
    } catch (error) {
        console.error('Add batch error:', error);
        req.flash('error_msg', 'Error adding batch');
        res.redirect(`/inventory/batches/${req.params.id}`);
    }
});

// 🎯 STOCK TRANSFER - View transfer page (Admin Only)
router.get('/transfer', isAuthenticated, async (req, res) => {
    try {
        // Check if user is admin
        if (req.session.user.role !== 'admin') {
            req.flash('error_msg', 'Only admin can access stock transfer');
            return res.redirect('/inventory');
        }
        
        const products = await Product.find({}).select('name stock unit branch addedBy').sort({ name: 1 });
        const transfers = await StockTransfer.find({})
            .populate('productId', 'name')
            .populate('initiatedBy', 'fullName username')
            .populate('approvedBy', 'fullName username')
            .sort({ transferDate: -1 })
            .limit(50);
        
        // Get unique branches from existing employees (not admin)
        const User = require('../models/User');
        const employees = await User.find({ role: 'staff' }).select('fullName username branch');
        
        // Create branches list from employees
        const branches = [
            { name: 'Main Branch (Owner)', value: 'Main Branch', userId: null }
        ];
        
        employees.forEach(emp => {
            const branchName = emp.branch || `${emp.fullName || emp.username}'s Branch`;
            branches.push({
                name: branchName,
                value: branchName,
                userId: emp._id.toString(),
                employeeName: emp.fullName || emp.username
            });
        });
        
        res.render('inventory/stock-transfer', { products, transfers, branches });
    } catch (error) {
        console.error('Stock transfer error:', error);
        req.flash('error_msg', 'Error loading stock transfer page');
        res.redirect('/inventory');
    }
});

// 🎯 STOCK TRANSFER - Create transfer (Admin Only)
router.post('/transfer', isAuthenticated, async (req, res) => {
    try {
        // Check if user is admin
        if (req.session.user.role !== 'admin') {
            req.flash('error_msg', 'Only admin can create stock transfer');
            return res.redirect('/inventory');
        }
        
        const { productId, quantity, sourceBranch, destinationBranch, notes } = req.body;
        
        // Validate input
        if (!productId || !quantity || !sourceBranch || !destinationBranch) {
            req.flash('error_msg', 'All fields are required');
            return res.redirect('/inventory/transfer');
        }
        
        if (sourceBranch === destinationBranch) {
            req.flash('error_msg', 'Source and destination branches cannot be the same');
            return res.redirect('/inventory/transfer');
        }
        
        const transferQty = parseInt(quantity);
        if (transferQty < 1) {
            req.flash('error_msg', 'Quantity must be at least 1');
            return res.redirect('/inventory/transfer');
        }
        
        // Find the source product (the actual product selected)
        const sourceProduct = await Product.findById(productId);
        if (!sourceProduct) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/inventory/transfer');
        }
        
        // Verify the source product belongs to the source branch
        const sourceProductBranch = sourceProduct.branch || 'Main Branch';
        if (sourceProductBranch !== sourceBranch) {
            req.flash('error_msg', `Product does not belong to ${sourceBranch}`);
            return res.redirect('/inventory/transfer');
        }
        
        // Check if sufficient stock available in source
        if (sourceProduct.stock < transferQty) {
            req.flash('error_msg', `Insufficient stock! Available: ${sourceProduct.stock} ${sourceProduct.unit}`);
            return res.redirect('/inventory/transfer');
        }
        
        // Find or create product in destination branch
        let destProduct = await Product.findOne({ 
            name: sourceProduct.name,
            branch: destinationBranch
        });
        
        if (!destProduct) {
            // Create new product in destination branch
            destProduct = new Product({
                name: sourceProduct.name,
                category: sourceProduct.category,
                price: sourceProduct.price,
                purchasePrice: sourceProduct.purchasePrice || 0,
                sellingPrice: sourceProduct.sellingPrice || sourceProduct.price,
                stock: 0,
                unit: sourceProduct.unit,
                reorderLevel: sourceProduct.reorderLevel || 10,
                description: sourceProduct.description || '',
                mfgDate: sourceProduct.mfgDate,
                expiryDate: sourceProduct.expiryDate,
                branch: destinationBranch,
                addedBy: req.session.user.id
            });
        }
        
        // Record old values for logging
        const oldSourceStock = sourceProduct.stock;
        const oldDestStock = destProduct.stock;
        
        // Perform the transfer: REDUCE from source, ADD to destination
        sourceProduct.stock -= transferQty;
        destProduct.stock += transferQty;
        
        // Save both products
        await sourceProduct.save();
        await destProduct.save();
        
        // Create transfer record
        const transfer = new StockTransfer({
            productId: sourceProduct._id,
            productName: sourceProduct.name,
            quantity: transferQty,
            sourceBranch,
            destinationBranch,
            notes: notes || '',
            initiatedBy: req.session.user.id,
            approvedBy: req.session.user.id,
            status: 'Completed',
            completedDate: new Date()
        });
        await transfer.save();
        
        // Log stock history for source (OUTGOING)
        const stockHistoryOut = new StockHistory({
            productId: sourceProduct._id,
            productName: sourceProduct.name,
            action: 'STOCK_TRANSFER_OUT',
            oldValue: { stock: oldSourceStock },
            newValue: { stock: sourceProduct.stock },
            quantityChanged: -transferQty,
            reason: `Transferred to ${destinationBranch}`,
            performedBy: req.session.user.id,
            performedByName: req.session.user.fullName || req.session.user.username,
            branch: sourceBranch
        });
        await stockHistoryOut.save();
        
        // Log stock history for destination (INCOMING)
        const stockHistoryIn = new StockHistory({
            productId: destProduct._id,
            productName: destProduct.name,
            action: 'STOCK_TRANSFER_IN',
            oldValue: { stock: oldDestStock },
            newValue: { stock: destProduct.stock },
            quantityChanged: transferQty,
            reason: `Received from ${sourceBranch}`,
            performedBy: req.session.user.id,
            performedByName: req.session.user.fullName || req.session.user.username,
            branch: destinationBranch
        });
        await stockHistoryIn.save();
        
        console.log(`[TRANSFER] ${transferQty} units of "${sourceProduct.name}" transferred from ${sourceBranch} to ${destinationBranch}`);
        
        req.flash('success_msg', `✅ Successfully transferred ${transferQty} ${sourceProduct.unit} of "${sourceProduct.name}" from ${sourceBranch} to ${destinationBranch}`);
        res.redirect('/inventory/transfer');
    } catch (error) {
        console.error('Transfer error:', error);
        req.flash('error_msg', 'Error creating transfer: ' + error.message);
        res.redirect('/inventory/transfer');
    }
});

// 🎯 API ENDPOINT - Get product details
router.get('/api/product/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('addedBy', 'fullName username')
            .populate('updatedBy', 'fullName username');
        res.json({ success: true, product });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;
