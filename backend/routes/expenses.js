const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Expense = require('../models/Expense');

// Get all expenses
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let filter = {};
        
        // Date filter
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }
        
        // Category filter
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        const expenses = await Expense.find(filter)
            .populate('addedBy', 'fullName')
            .sort({ date: -1, createdAt: -1 });
        
        res.render('expenses/list', { expenses, filters: { startDate, endDate, category } });
    } catch (error) {
        console.error('Expenses list error:', error);
        req.flash('error_msg', 'Error loading expenses');
        res.redirect('/dashboard');
    }
});

// Show add expense form
router.get('/add', isAuthenticated, (req, res) => {
    res.render('expenses/add');
});

// Add new expense
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { category, description, amount, date, paymentMethod, notes } = req.body;
        
        await Expense.create({
            category,
            description,
            amount: parseFloat(amount),
            date: date ? new Date(date) : new Date(),
            paymentMethod,
            notes,
            addedBy: req.session.user.id
        });
        
        req.flash('success_msg', 'Expense added successfully');
        res.redirect('/expenses');
    } catch (error) {
        console.error('Add expense error:', error);
        req.flash('error_msg', 'Error adding expense');
        res.redirect('/expenses/add');
    }
});

// Delete expense
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ success: false, message: 'Error deleting expense' });
    }
});

module.exports = router;
