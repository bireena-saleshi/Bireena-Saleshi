const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { sendBillSMS } = require('../utils/sms');

// View all sales
router.get('/', isAuthenticated, async (req, res) => {
    try {
        let filter = {};
        
        // If user is employee (staff), only show sales from their branch
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sales = await Sale.find(filter)
            .sort({ createdAt: -1 })
            .populate('items.product')
            .populate('createdBy', 'fullName username role branch');
        
        // Group sales by admin and branches
        const adminSales = sales.filter(sale => sale.createdBy && sale.createdBy.role === 'admin');
        const employeeSales = sales.filter(sale => sale.createdBy && sale.createdBy.role === 'staff');
        
        // Group employee sales by branch
        const salesByBranch = {};
        employeeSales.forEach(sale => {
            const branch = sale.createdBy.branch || 'Main Branch';
            if (!salesByBranch[branch]) {
                salesByBranch[branch] = [];
            }
            salesByBranch[branch].push(sale);
        });
        
        res.render('sales/list', { 
            sales,
            adminSales,
            salesByBranch,
            user: req.session.user,
            page: 'sales'
        });
    } catch (error) {
        console.error('Sales error:', error);
        req.flash('error_msg', 'Error loading sales');
        res.redirect('/dashboard');
    }
});

// New sale page
router.get('/new', isAuthenticated, async (req, res) => {
    try {
        let filter = { stock: { $gt: 0 } };
        
        // If user is employee (staff), only show products from their branch
        if (req.session.user.role === 'staff') {
            filter.addedBy = req.session.user.id;
        }
        
        const products = await Product.find(filter).sort({ name: 1 });
        res.render('sales/new', { products });
    } catch (error) {
        console.error('New sale error:', error);
        req.flash('error_msg', 'Error loading products');
        res.redirect('/sales');
    }
});

// Create sale - All calculations done on backend for security
router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const { items, customerName, customerPhone, paymentMethod, discount, discountType, amountPaid } = req.body;

        // Validation
        if (!items || items.length === 0) {
            req.flash('error_msg', 'No items in cart');
            return res.redirect('/sales/new');
        }

        // Parse items (from frontend cart)
        const parsedItems = JSON.parse(items);
        
        // **BACKEND SECURITY: Validate and recalculate everything**
        const saleItems = [];
        let subtotal = 0;

        for (const item of parsedItems) {
            // Fetch fresh product data from database (don't trust frontend prices)
            const product = await Product.findById(item.productId);
            
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            
            // Validate quantity
            const quantity = parseInt(item.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error(`Invalid quantity for ${product.name}`);
            }
            
            // Check stock availability
            if (product.stock < quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }

            // **SECURITY: Use database price, not frontend price**
            const actualPrice = parseFloat(product.price);
            const itemSubtotal = actualPrice * quantity;
            
            saleItems.push({
                product: product._id,
                productName: product.name,
                quantity: quantity,
                price: actualPrice,  // Backend price, not frontend
                subtotal: itemSubtotal
            });
            
            subtotal += itemSubtotal;

            // Update product stock
            product.stock -= quantity;
            await product.save();
        }

        // **BACKEND CALCULATION: Discount**
        let discountAmount = 0;
        const discountValue = parseFloat(discount) || 0;
        
        if (discountValue > 0) {
            if (discountType === 'percentage') {
                // Validate percentage (0-100)
                if (discountValue > 100) {
                    throw new Error('Discount percentage cannot exceed 100%');
                }
                discountAmount = (subtotal * discountValue) / 100;
            } else {
                // Fixed amount discount
                if (discountValue > subtotal) {
                    throw new Error('Discount amount cannot exceed subtotal');
                }
                discountAmount = discountValue;
            }
        }

        // **BACKEND CALCULATION: Total**
        const total = subtotal - discountAmount;
        
        // **BACKEND CALCULATION: Payment status**
        const paidAmount = parseFloat(amountPaid) || 0;
        
        // **SECURITY: Validate paid amount - cannot exceed total**
        if (paidAmount < 0) {
            throw new Error('Paid amount cannot be negative');
        }
        
        if (paidAmount > total) {
            throw new Error(`Paid amount (₹${paidAmount.toFixed(2)}) cannot exceed total bill amount (₹${total.toFixed(2)})`);
        }
        
        const due = Math.max(0, total - paidAmount);
        
        let paymentStatus = 'paid';
        if (due > 0) {
            paymentStatus = paidAmount > 0 ? 'partial' : 'due';
        }
        
        // Security log
        console.log(`[PAYMENT] User: ${req.session.user.username}, Bill: BILL-XXXX, Amount: ${total}, Paid: ${paidAmount}, Due: ${due}`);

        // Generate bill number
        const lastSale = await Sale.findOne().sort({ createdAt: -1 });
        let billNumber = 'BILL-0001';
        if (lastSale) {
            const lastNumber = parseInt(lastSale.billNumber.split('-')[1]);
            billNumber = `BILL-${String(lastNumber + 1).padStart(4, '0')}`;
        }

        // Create sale
        const sale = new Sale({
            billNumber,
            items: saleItems,
            subtotal,
            discount: discountAmount,
            discountType,
            total,
            amountPaid: paidAmount,
            dueAmount: due,
            paymentStatus,
            customerName: customerName && customerName.trim() !== '' ? customerName : 'N/A',
            customerPhone: customerPhone || '',
            paymentMethod: paymentMethod || 'cash',
            createdBy: req.session.user.id
        });

        await sale.save();

        // Send SMS if phone number provided
        if (customerPhone && customerPhone.trim() !== '') {
            const smsResult = await sendBillSMS(customerPhone, {
                billNumber,
                customerName: customerName && customerName.trim() !== '' ? customerName : 'N/A',
                items: saleItems,
                subtotal,
                discountAmount,
                total,
                paymentMethod: paymentMethod || 'cash'
            });

            if (smsResult.success) {
                sale.smsSent = true;
                await sale.save();
            }
        }

        req.flash('success_msg', 'Sale completed successfully');
        // Redirect directly to print page instead of bill view
        res.redirect(`/bill/print/${sale._id}`);
    } catch (error) {
        console.error('Create sale error:', error);
        req.flash('error_msg', error.message || 'Error creating sale');
        res.redirect('/sales/new');
    }
});

// View sale details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        
        // If user is employee (staff), only allow access to their own branch sales
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter).populate('items.product');
        if (!sale) {
            req.flash('error_msg', 'Sale not found or access denied');
            return res.redirect('/sales');
        }
        res.render('sales/view', { sale });
    } catch (error) {
        console.error('View sale error:', error);
        req.flash('error_msg', 'Error loading sale');
        res.redirect('/sales');
    }
});

// Clear due payment
router.post('/clear-due/:id', isAuthenticated, async (req, res) => {
    try {
        const { paymentAmount } = req.body;
        
        let filter = { _id: req.params.id };
        
        // If user is employee (staff), only allow access to their own branch sales
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter);
        
        if (!sale) {
            req.flash('error_msg', 'Sale not found or access denied');
            return res.redirect('/sales');
        }

        if (sale.paymentStatus === 'paid') {
            req.flash('error_msg', 'This bill is already fully paid');
            return res.redirect(`/bill/${sale._id}`);
        }

        // **BACKEND VALIDATION: Payment amount**
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            req.flash('error_msg', 'Invalid payment amount');
            return res.redirect(`/bill/${sale._id}`);
        }

        if (amount > sale.dueAmount) {
            req.flash('error_msg', 'Payment amount cannot exceed due amount');
            return res.redirect(`/bill/${sale._id}`);
        }

        // **BACKEND CALCULATION: Update payment details**
        sale.amountPaid += amount;
        sale.dueAmount -= amount;

        // **BACKEND CALCULATION: Update payment status**
        if (sale.dueAmount === 0) {
            sale.paymentStatus = 'paid';
        } else if (sale.dueAmount > 0 && sale.amountPaid > 0) {
            sale.paymentStatus = 'partial';
        }

        // Add payment history with security log
        if (!sale.paymentHistory) {
            sale.paymentHistory = [];
        }
        sale.paymentHistory.push({
            amount: amount,
            date: new Date(),
            method: req.body.paymentMethod || 'cash',
            receivedBy: req.session.user.id
        });

        await sale.save();

        // Security log
        console.log(`[PAYMENT] User: ${req.session.user.username}, Bill: ${sale.billNumber}, Amount: ${amount}, Remaining: ${sale.dueAmount}`);

        req.flash('success_msg', `Payment of ₹${amount.toFixed(2)} received successfully. Remaining due: ₹${sale.dueAmount.toFixed(2)}`);
        res.redirect(`/bill/${sale._id}`);
    } catch (error) {
        console.error('Clear due error:', error);
        req.flash('error_msg', 'Error processing payment');
        res.redirect('/sales');
    }
});

// **SECURITY API: Validate product prices from backend**
router.post('/api/validate-cart', isAuthenticated, async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid cart data' 
            });
        }

        const validatedItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Product not found: ${item.productId}` 
                });
            }

            // Check stock
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                });
            }

            // Return actual backend price
            const actualPrice = parseFloat(product.price);
            const itemSubtotal = actualPrice * item.quantity;

            validatedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: actualPrice,  // Backend price
                subtotal: itemSubtotal,
                stock: product.stock
            });

            subtotal += itemSubtotal;
        }

        res.json({
            success: true,
            items: validatedItems,
            subtotal: subtotal
        });

    } catch (error) {
        console.error('Cart validation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during validation' 
        });
    }
});

// **SECURITY API: Calculate total with discount (backend calculation)**
router.post('/api/calculate-total', isAuthenticated, async (req, res) => {
    try {
        const { subtotal, discount, discountType } = req.body;

        const sub = parseFloat(subtotal) || 0;
        const disc = parseFloat(discount) || 0;
        let discountAmount = 0;

        if (disc > 0) {
            if (discountType === 'percentage') {
                if (disc > 100) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Discount percentage cannot exceed 100%' 
                    });
                }
                discountAmount = (sub * disc) / 100;
            } else {
                if (disc > sub) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Discount amount cannot exceed subtotal' 
                    });
                }
                discountAmount = disc;
            }
        }

        const total = sub - discountAmount;

        res.json({
            success: true,
            subtotal: sub,
            discountAmount: discountAmount,
            total: total
        });

    } catch (error) {
        console.error('Calculate total error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during calculation' 
        });
    }
});

// Cancel sale page
router.get('/cancel/:id', isAuthenticated, async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        
        // Staff can only cancel their own sales
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter)
            .populate('items.product')
            .populate('createdBy', 'fullName username');
        
        if (!sale) {
            req.flash('error_msg', 'Sale not found');
            return res.redirect('/sales');
        }
        
        if (sale.isCancelled) {
            req.flash('error_msg', 'Sale is already cancelled');
            return res.redirect('/bill/' + sale._id);
        }
        
        res.render('sales/cancel', { sale });
    } catch (error) {
        console.error('Cancel sale page error:', error);
        req.flash('error_msg', 'Error loading cancellation page');
        res.redirect('/sales');
    }
});

// Process sale cancellation
router.post('/cancel/:id', isAuthenticated, async (req, res) => {
    try {
        const { cancellationReason, refundAmount, refundMethod, refundNotes } = req.body;
        
        let filter = { _id: req.params.id };
        
        // Staff can only cancel their own sales
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter).populate('items.product');
        
        if (!sale) {
            req.flash('error_msg', 'Sale not found');
            return res.redirect('/sales');
        }
        
        if (sale.isCancelled) {
            req.flash('error_msg', 'Sale is already cancelled');
            return res.redirect('/bill/' + sale._id);
        }
        
        // Validate refund amount
        const refundAmt = parseFloat(refundAmount) || 0;
        if (refundAmt < 0 || refundAmt > sale.amountPaid) {
            req.flash('error_msg', `Refund amount cannot exceed paid amount of ₹${sale.amountPaid.toFixed(2)}`);
            return res.redirect(`/sales/cancel/${sale._id}`);
        }
        
        // Restore inventory for all items
        for (const item of sale.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }
        
        // Update sale with cancellation details
        sale.isCancelled = true;
        sale.cancelledAt = new Date();
        sale.cancelledBy = req.session.user.id;
        sale.cancellationReason = cancellationReason || 'No reason provided';
        sale.refundAmount = refundAmt;
        sale.refundMethod = refundMethod || 'none';
        sale.refundProcessedBy = req.session.user.id;
        sale.refundNotes = refundNotes || '';
        
        await sale.save();
        
        req.flash('success_msg', `Sale cancelled successfully. Refund: ₹${refundAmt.toFixed(2)}`);
        res.redirect('/bill/' + sale._id);
    } catch (error) {
        console.error('Cancel sale error:', error);
        req.flash('error_msg', 'Error cancelling sale');
        res.redirect('/sales');
    }
});

module.exports = router;
