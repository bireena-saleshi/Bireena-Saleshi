const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Expense = require('../models/Expense');

// Employee Activity Dashboard (Admin Only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employees = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
        res.render('employee-activity/dashboard', { employees });
    } catch (error) {
        console.error('Employee activity error:', error);
        req.flash('error_msg', 'Error loading employee activity');
        res.redirect('/dashboard');
    }
});

// Individual Employee Activity Report (Admin Only)
router.get('/:employeeId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employee = await User.findById(req.params.employeeId);
        
        if (!employee || employee.role !== 'staff') {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employee-activity');
        }

        // Get sales created by this employee
        const sales = await Sale.find({ createdBy: employee._id })
            .sort({ createdAt: -1 })
            .populate('items.product');

        // Calculate sales statistics
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalDue = sales.reduce((sum, sale) => sum + sale.dueAmount, 0);
        const totalCollected = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);

        // Get products added by this employee
        const productsAdded = await Product.find({ addedBy: employee._id })
            .sort({ createdAt: -1 });

        // Get products updated by this employee
        const productsUpdated = await Product.find({ updatedBy: employee._id })
            .sort({ updatedAt: -1 });

        // Get expenses added by this employee
        const expenses = await Expense.find({ addedBy: employee._id })
            .sort({ createdAt: -1 });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Get payment collections by this employee
        const paymentCollections = await Sale.find({
            'paymentHistory.receivedBy': employee._id
        }).populate('paymentHistory.receivedBy');

        let totalPaymentsCollected = 0;
        let paymentCount = 0;

        paymentCollections.forEach(sale => {
            sale.paymentHistory.forEach(payment => {
                if (payment.receivedBy && payment.receivedBy._id.toString() === employee._id.toString()) {
                    totalPaymentsCollected += payment.amount;
                    paymentCount++;
                }
            });
        });

        // Sales by payment status
        const paidSales = sales.filter(s => s.paymentStatus === 'paid').length;
        const partialSales = sales.filter(s => s.paymentStatus === 'partial').length;
        const dueSales = sales.filter(s => s.paymentStatus === 'due').length;

        // Recent activity
        const recentSales = sales.slice(0, 10);

        res.render('employee-activity/detail', {
            employee,
            sales,
            productsAdded,
            productsUpdated,
            expenses,
            stats: {
                totalSales,
                totalRevenue,
                totalDue,
                totalCollected,
                paidSales,
                partialSales,
                dueSales,
                productsAddedCount: productsAdded.length,
                productsUpdatedCount: productsUpdated.length,
                totalPaymentsCollected,
                paymentCount,
                expensesCount: expenses.length,
                totalExpenses
            },
            recentSales
        });

    } catch (error) {
        console.error('Employee detail error:', error);
        req.flash('error_msg', 'Error loading employee details');
        res.redirect('/employee-activity');
    }
});

// Compare employees performance (Admin Only)
router.get('/compare/all', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employees = await User.find({ role: 'staff' });
        
        const employeeStats = await Promise.all(employees.map(async (employee) => {
            const sales = await Sale.find({ createdBy: employee._id });
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
            const totalSales = sales.length;
            const productsAdded = await Product.countDocuments({ addedBy: employee._id });

            return {
                employee,
                totalSales,
                totalRevenue,
                productsAdded,
                averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
            };
        }));

        // Sort by revenue
        employeeStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

        res.render('employee-activity/compare', { employeeStats });

    } catch (error) {
        console.error('Compare error:', error);
        req.flash('error_msg', 'Error comparing employees');
        res.redirect('/employee-activity');
    }
});

module.exports = router;
