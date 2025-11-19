const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// Reports page with filters
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, type, paymentStatus, employee } = req.query;
        
        let filter = {};
        
        // Branch-specific filtering for employees
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        // Employee filter for admin (only if admin and employee is selected)
        if (req.session.user.role === 'admin' && employee) {
            filter.createdBy = employee;
        }
        
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Get sales data with payment status filter
        const salesFilter = type === 'expenses' ? null : { ...filter };
        if (salesFilter && paymentStatus) {
            salesFilter.paymentStatus = paymentStatus;
        }
        const sales = salesFilter !== null ? await Sale.find(salesFilter).sort({ createdAt: -1 }).populate('createdBy', 'fullName username') : [];
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalPaid = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
        const totalDue = sales.reduce((sum, sale) => sum + sale.dueAmount, 0);

        // Get expenses data (also filter by branch for employees)
        const expensesFilter = type === 'sales' ? null : { ...filter };
        if (expensesFilter && req.session.user.role === 'admin' && employee) {
            expensesFilter.addedBy = employee;
        }
        const expenses = expensesFilter !== null ? await Expense.find(expensesFilter).sort({ createdAt: -1 }).populate('addedBy', 'fullName username') : [];
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Calculate profit
        const profit = totalSales - totalExpenses;
        
        // Get all employees for filter dropdown (only for admin)
        const User = require('../models/User');
        const employees = req.session.user.role === 'admin' ? 
            await User.find({ role: 'staff' }).select('fullName username').sort({ fullName: 1 }) : [];

        res.render('reports/index', {
            sales,
            expenses,
            employees,
            stats: {
                totalSales,
                totalPaid,
                totalDue,
                totalExpenses,
                profit
            },
            filters: { startDate, endDate, type, paymentStatus, employee }
        });
    } catch (error) {
        console.error('Reports error:', error);
        req.flash('error_msg', 'Error loading reports');
        res.redirect('/dashboard');
    }
});

// Add expense page
router.get('/expense/add', isAuthenticated, (req, res) => {
    res.render('reports/add-expense');
});

// Create expense
router.post('/expense/add', isAuthenticated, async (req, res) => {
    try {
        const { category, description, amount, date, paymentMethod, notes } = req.body;

        const expense = new Expense({
            category,
            description,
            amount: parseFloat(amount),
            date: date ? new Date(date) : Date.now(),
            paymentMethod,
            notes,
            addedBy: req.session.user.id
        });

        await expense.save();
        req.flash('success_msg', 'Expense added successfully');
        res.redirect('/reports');
    } catch (error) {
        console.error('Add expense error:', error);
        req.flash('error_msg', 'Error adding expense');
        res.redirect('/reports/expense/add');
    }
});

// Delete expense
router.post('/expense/delete/:id', isAuthenticated, async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Expense deleted successfully');
        res.redirect('/reports');
    } catch (error) {
        console.error('Delete expense error:', error);
        req.flash('error_msg', 'Error deleting expense');
        res.redirect('/reports');
    }
});

module.exports = router;
