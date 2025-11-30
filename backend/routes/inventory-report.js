const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const DailyInventoryReport = require('../models/DailyInventoryReport');
const Product = require('../models/Product');
const User = require('../models/User');

// View inventory report page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, employee } = req.query;
        
        // Default to last 7 days if no dates provided
        let end, start;
        
        if (endDate) {
            // Parse as local date and set to end of day
            const [year, month, day] = endDate.split('-').map(Number);
            end = new Date(year, month - 1, day, 23, 59, 59, 999);
        } else {
            end = new Date();
            end.setHours(23, 59, 59, 999);
        }
        
        if (startDate) {
            // Parse as local date and set to start of day
            const [year, month, day] = startDate.split('-').map(Number);
            start = new Date(year, month - 1, day, 0, 0, 0, 0);
        } else {
            start = new Date(end);
            start.setDate(start.getDate() - 6); // Last 7 days
            start.setHours(0, 0, 0, 0);
        }
        
        // Build query filter
        let filter = {
            date: { $gte: start, $lte: end }
        };
        
        // If employee (staff), show only their branch
        if (req.session.user.role === 'staff') {
            const user = await User.findById(req.session.user.id).select('branch');
            const userBranch = user && user.branch ? user.branch : 'Main Branch';
            filter.branch = userBranch;
        }
        // If admin and employee filter is selected
        else if (req.session.user.role === 'admin' && employee && employee !== 'all') {
            // Get products added by this employee
            const employeeProducts = await Product.find({ addedBy: employee }).select('_id');
            const productIds = employeeProducts.map(p => p._id);
            filter.productId = { $in: productIds };
        }
        
        // Get daily reports
        const reports = await DailyInventoryReport.find(filter).sort({ date: -1, productName: 1 });
        
        // Get all employees for admin filter (including admin)
        const allEmployees = req.session.user.role === 'admin' ? 
            await User.find({ isActive: true }).select('_id fullName role').sort({ fullName: 1 }) : [];
        
        // Group by date and calculate totals
        const reportsByDate = {};
        reports.forEach(report => {
            // Use local date string for grouping
            const localDate = new Date(report.date);
            const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
            if (!reportsByDate[dateKey]) {
                reportsByDate[dateKey] = [];
            }
            reportsByDate[dateKey].push(report);
        });
        
        // Format dates for input fields
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        res.render('inventory/daily-report', {
            reportsByDate,
            startDate: formatDate(start),
            endDate: formatDate(end),
            employees: allEmployees,
            selectedEmployee: employee || 'all'
        });
    } catch (error) {
        console.error('Inventory report error:', error);
        req.flash('error_msg', 'Error loading inventory report');
        res.redirect('/inventory');
    }
});

// Generate daily snapshot (should be called at end of day or manually)
router.post('/generate', isAuthenticated, async (req, res) => {
    try {
        const { date } = req.body;
        
        // Create date at start of today (local time)
        let reportDate;
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            reportDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        } else {
            reportDate = new Date();
            reportDate.setHours(0, 0, 0, 0);
        }
        
        // Get all products with prices
        const products = await Product.find({});
        
        let createdCount = 0;
        let updatedCount = 0;
        
        for (const product of products) {
            // Get previous day's closing stock
            const previousDate = new Date(reportDate);
            previousDate.setDate(previousDate.getDate() - 1);
            previousDate.setHours(0, 0, 0, 0);
            
            const previousReport = await DailyInventoryReport.findOne({
                productId: product._id,
                date: { 
                    $gte: previousDate, 
                    $lt: new Date(previousDate.getTime() + 24 * 60 * 60 * 1000) 
                },
                branch: product.branch || 'Main Branch'
            });
            
            const openingStock = previousReport ? previousReport.closingStock : product.stock;
            const purchasePrice = product.purchasePrice || 0;
            const sellingPrice = product.sellingPrice || product.price || 0;
            
            // Check if report already exists for today
            const existingReport = await DailyInventoryReport.findOne({
                productId: product._id,
                date: { 
                    $gte: reportDate, 
                    $lt: new Date(reportDate.getTime() + 24 * 60 * 60 * 1000) 
                },
                branch: product.branch || 'Main Branch'
            });
            
            if (existingReport) {
                // Update existing report with current prices and stock
                existingReport.closingStock = product.stock;
                existingReport.productName = product.name;
                existingReport.unit = product.unit;
                existingReport.category = product.category;
                existingReport.purchasePrice = purchasePrice;
                existingReport.sellingPrice = sellingPrice;
                existingReport.branch = product.branch || 'Main Branch';
                await existingReport.save();
                updatedCount++;
            } else {
                // Create new report
                await DailyInventoryReport.create({
                    date: reportDate,
                    productId: product._id,
                    productName: product.name,
                    openingStock: openingStock,
                    additions: Math.max(0, product.stock - openingStock),
                    sales: 0, // Will be updated from sales data
                    damage: 0, // Will be updated from damage entries
                    closingStock: product.stock,
                    unit: product.unit,
                    category: product.category,
                    purchasePrice: purchasePrice,
                    sellingPrice: sellingPrice,
                    branch: product.branch || 'Main Branch'
                });
                createdCount++;
            }
        }
        
        req.flash('success_msg', `Daily inventory report generated successfully! Created: ${createdCount}, Updated: ${updatedCount}`);
        res.redirect('/inventory-report');
    } catch (error) {
        console.error('Generate report error:', error);
        req.flash('error_msg', 'Error generating inventory report');
        res.redirect('/inventory-report');
    }
});

module.exports = router;
