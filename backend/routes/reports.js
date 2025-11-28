const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// Export CSV route
router.get('/export-csv', isAuthenticated, async (req, res) => {
    try {
        console.log('📊 CSV Export Request:', req.query);
        const { startDate, endDate, type, paymentStatus, employee } = req.query;
        
        // Build date filter
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }
        
        // Build sales filter
        let salesFilter = type === 'expenses' ? null : {};
        if (salesFilter !== null) {
            // Date filter for sales (uses createdAt)
            if (startDate && endDate) {
                salesFilter.createdAt = dateFilter;
            }
            
            // Staff can only see their own sales
            if (req.session.user.role === 'staff') {
                salesFilter.createdBy = req.session.user.id;
            }
            
            // Admin: if employee filter is selected, show only that employee's sales
            // If no filter, show all sales (including admin's own)
            if (req.session.user.role === 'admin' && employee) {
                salesFilter.createdBy = employee;
            }
            
            // Payment status filter
            if (paymentStatus) {
                salesFilter.paymentStatus = paymentStatus;
            }
        }

        // Build expenses filter
        let expensesFilter = type === 'sales' ? null : {};
        if (expensesFilter !== null) {
            // Date filter for expenses (uses date field)
            if (startDate && endDate) {
                expensesFilter.date = dateFilter;
            }
            
            // Branch-specific filtering for employees
            if (req.session.user.role === 'staff') {
                expensesFilter.addedBy = req.session.user.id;
            }
            
            // Employee filter for admin
            if (req.session.user.role === 'admin' && employee) {
                expensesFilter.addedBy = employee;
            }
        }

        // Get sales data
        const sales = salesFilter !== null ? await Sale.find(salesFilter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'fullName username')
            .populate('items.product', 'name') : [];

        // Get expenses data
        const expenses = expensesFilter !== null ? await Expense.find(expensesFilter)
            .sort({ date: -1 })
            .populate('addedBy', 'fullName username') : [];

        // Create CSV content
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        
        // Summary Section
        csvContent += 'BIREENA BAKERY - FINANCIAL REPORT\n';
        csvContent += '=================================\n';
        csvContent += `Report Generated: ${new Date().toLocaleString('en-IN')}\n`;
        if (startDate && endDate) {
            csvContent += `Period: ${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}\n`;
        }
        csvContent += '\n';
        
        // Summary Statistics
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalPaid = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
        const totalDue = sales.reduce((sum, sale) => sum + sale.dueAmount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const profit = totalSales - totalExpenses;
        
        csvContent += 'SUMMARY STATISTICS\n';
        csvContent += 'Metric,Amount (₹)\n';
        csvContent += `Total Sales,${totalSales.toFixed(2)}\n`;
        csvContent += `Amount Paid,${totalPaid.toFixed(2)}\n`;
        csvContent += `Total Due,${totalDue.toFixed(2)}\n`;
        csvContent += `Total Expenses,${totalExpenses.toFixed(2)}\n`;
        csvContent += `Net Profit,${profit.toFixed(2)}\n`;
        csvContent += '\n';

        // Sales Details
        if (sales.length > 0) {
            csvContent += 'SALES DETAILS\n';
            csvContent += 'Bill Number,Date,Time,Customer Name,Customer Phone,Employee,Items,Quantity,Total Amount (₹),Amount Paid (₹),Due Amount (₹),Payment Status,Payment Method\n';
            
            sales.forEach(sale => {
                const date = new Date(sale.createdAt).toLocaleDateString('en-IN');
                const time = new Date(sale.createdAt).toLocaleTimeString('en-IN');
                const employee = sale.createdBy ? (sale.createdBy.fullName || sale.createdBy.username) : 'Unknown';
                const items = sale.items.map(item => {
                    const productName = item.product ? item.product.name : 'Unknown Product';
                    return `${productName} (${item.quantity})`;
                }).join('; ');
                const totalQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                
                csvContent += `"${sale.billNumber}","${date}","${time}","${sale.customerName}","${sale.customerPhone}","${employee}","${items}",${totalQty},${sale.total.toFixed(2)},${sale.amountPaid.toFixed(2)},${sale.dueAmount.toFixed(2)},"${sale.paymentStatus.toUpperCase()}","${sale.paymentMethod.toUpperCase()}"\n`;
            });
            csvContent += '\n';
        }

        // Expenses Details
        if (expenses.length > 0) {
            csvContent += 'EXPENSES DETAILS\n';
            csvContent += 'Date,Time,Category,Description,Amount (₹),Payment Method,Added By,Notes\n';
            
            expenses.forEach(expense => {
                const date = new Date(expense.date).toLocaleDateString('en-IN');
                const time = new Date(expense.date).toLocaleTimeString('en-IN');
                const addedBy = expense.addedBy ? (expense.addedBy.fullName || expense.addedBy.username) : 'Unknown';
                const notes = expense.notes || '';
                
                csvContent += `"${date}","${time}","${expense.category}","${expense.description}",${expense.amount.toFixed(2)},"${expense.paymentMethod.toUpperCase()}","${addedBy}","${notes}"\n`;
            });
            csvContent += '\n';
        }

        // Footer
        csvContent += '\n';
        csvContent += '=================================\n';
        csvContent += 'Report End\n';

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="Bireena_Bakery_Report_${new Date().toISOString().split('T')[0]}.csv"`);
        
        console.log('✅ CSV Export Success - Size:', csvContent.length, 'bytes');
        
        // Send CSV
        res.send(csvContent);

    } catch (error) {
        console.error('❌ CSV Export error:', error);
        res.status(500).json({ error: 'Error generating CSV export', message: error.message });
    }
});

// Reports page with filters
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, type, paymentStatus, employee } = req.query;
        
        let filter = {};
        
        // Staff can only see their own sales
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        // Admin: if employee filter is selected, show only that employee's sales
        // If no filter, show all sales (including admin's own sales and all employees)
        if (req.session.user.role === 'admin' && employee) {
            filter.createdBy = employee;
        }
        // If admin and no employee filter, don't add createdBy filter - show all sales
        
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
        
        // Get all users for filter dropdown (only for admin) - includes admin and staff
        const User = require('../models/User');
        const employees = req.session.user.role === 'admin' ? 
            await User.find({ isActive: true }).select('fullName username role').sort({ fullName: 1 }) : [];

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
