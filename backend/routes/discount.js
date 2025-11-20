const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Discount = require('../models/Discount');

// View all discounts
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.render('discount/list', { discounts });
    } catch (error) {
        console.error('Discount error:', error);
        req.flash('error_msg', 'Error loading discounts');
        res.redirect('/dashboard');
    }
});

// Add discount page
router.get('/add', isAuthenticated, isAdmin, (req, res) => {
    res.render('discount/add');
});

// Create discount
router.post('/add', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, type, value, applicableOn, categoryOrProduct, startDate, endDate } = req.body;

        const discount = new Discount({
            name,
            type,
            value: parseFloat(value),
            applicableOn,
            categoryOrProduct: categoryOrProduct || '',
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });

        await discount.save();
        req.flash('success_msg', 'Discount added successfully');
        res.redirect('/discount');
    } catch (error) {
        console.error('Add discount error:', error);
        req.flash('error_msg', 'Error adding discount');
        res.redirect('/discount/add');
    }
});

// Toggle discount status
router.post('/toggle/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            req.flash('error_msg', 'Discount not found');
            return res.redirect('/discount');
        }

        discount.isActive = !discount.isActive;
        await discount.save();

        req.flash('success_msg', `Discount ${discount.isActive ? 'activated' : 'deactivated'}`);
        res.redirect('/discount');
    } catch (error) {
        console.error('Toggle discount error:', error);
        req.flash('error_msg', 'Error updating discount');
        res.redirect('/discount');
    }
});

// Delete discount
router.post('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Discount.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Discount deleted successfully');
        res.redirect('/discount');
    } catch (error) {
        console.error('Delete discount error:', error);
        req.flash('error_msg', 'Error deleting discount');
        res.redirect('/discount');
    }
});

module.exports = router;
