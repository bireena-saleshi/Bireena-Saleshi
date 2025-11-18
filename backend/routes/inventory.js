const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Product = require('../models/Product');

// View all products
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.render('inventory/list', { products });
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

// Create product
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { name, category, price, stock, unit, reorderLevel, description } = req.body;

        const product = new Product({
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            unit,
            reorderLevel: parseInt(reorderLevel || 10),
            description
        });

        await product.save();
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

// Update product
router.post('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, category, price, stock, unit, reorderLevel, description } = req.body;

        await Product.findByIdAndUpdate(req.params.id, {
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            unit,
            reorderLevel: parseInt(reorderLevel || 10),
            description,
            updatedAt: Date.now()
        });

        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/inventory');
    } catch (error) {
        console.error('Update product error:', error);
        req.flash('error_msg', 'Error updating product');
        res.redirect('/inventory');
    }
});

// Delete product
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
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
        const products = await Product.find({
            $expr: { $lte: ['$stock', '$reorderLevel'] }
        }).sort({ stock: 1 });
        res.render('inventory/low-stock', { products });
    } catch (error) {
        console.error('Low stock error:', error);
        req.flash('error_msg', 'Error loading low stock items');
        res.redirect('/inventory');
    }
});

module.exports = router;
