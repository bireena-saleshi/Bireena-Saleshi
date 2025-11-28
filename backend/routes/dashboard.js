const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { ensureDBConnection } = require('../middleware/database');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

// Dashboard home
router.get('/', ensureDBConnection, isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Branch-specific filtering for employees
        let productFilter = {};
        let salesFilter = {};
        
        if (req.session.user.role === 'staff') {
            // Employee only sees their own branch data
            productFilter.addedBy = req.session.user.id;
            salesFilter.createdBy = req.session.user.id;
        }

        // Get statistics
        const totalProducts = await Product.countDocuments(productFilter);
        const lowStockProducts = await Product.countDocuments({ 
            ...productFilter,
            $expr: { $lte: ['$stock', '$reorderLevel'] } 
        });

        // 🎯 EXPIRY ALERTS - Count expiring soon products
        const expiringProducts = await Product.countDocuments({
            ...productFilter,
            expirySoon: true,
            expiryDate: { $gte: new Date() } // Not yet expired
        });

        // 🎯 EXPIRY ALERTS - Count expired products
        const expiredProducts = await Product.countDocuments({
            ...productFilter,
            expiryDate: { $lt: new Date() } // Already expired
        });

        // Today's sales
        const todaySales = await Sale.find({ 
            ...salesFilter,
            createdAt: { $gte: today } 
        });
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

        // Total revenue
        const allSales = await Sale.find(salesFilter);
        const totalRevenue = allSales.reduce((sum, sale) => sum + sale.total, 0);

        // Recent sales
        const recentSales = await Sale.find(salesFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('items.product')
            .populate('createdBy', 'fullName username');

        // Employee reports (only for admin)
        let employeeReports = [];
        let ownBranchReport = null;
        
        if (req.session.user.role === 'admin') {
            const employees = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
            
            employeeReports = await Promise.all(employees.map(async (employee) => {
                // Branch-specific sales data
                const employeeSales = await Sale.find({ createdBy: employee._id });
                const employeeTotalRevenue = employeeSales.reduce((sum, sale) => sum + sale.total, 0);
                const todayEmployeeSales = await Sale.find({ 
                    createdBy: employee._id,
                    createdAt: { $gte: today } 
                });
                const todayEmployeeRevenue = todayEmployeeSales.reduce((sum, sale) => sum + sale.total, 0);
                
                // Branch-specific product data (products added/managed by this employee)
                const branchProducts = await Product.find({ addedBy: employee._id });
                const totalBranchProducts = branchProducts.length;
                const lowStockBranchProducts = branchProducts.filter(product => 
                    product.stock <= product.reorderLevel
                ).length;
                
                return {
                    employee,
                    branchStats: {
                        totalProducts: totalBranchProducts,
                        lowStockProducts: lowStockBranchProducts,
                        todaySales: todayEmployeeSales.length,
                        todayRevenue: todayEmployeeRevenue,
                        totalRevenue: employeeTotalRevenue
                    },
                    totalSales: employeeSales.length,
                    totalRevenue: employeeTotalRevenue,
                    todaySales: todayEmployeeSales.length,
                    todayRevenue: todayEmployeeRevenue
                };
            }));
        } else if (req.session.user.role === 'staff') {
            // For employees, show their own branch report
            const currentUser = await User.findById(req.session.user.id);
            const employeeSales = await Sale.find({ createdBy: req.session.user.id });
            const employeeTotalRevenue = employeeSales.reduce((sum, sale) => sum + sale.total, 0);
            const todayEmployeeSales = await Sale.find({ 
                createdBy: req.session.user.id,
                createdAt: { $gte: today } 
            });
            const todayEmployeeRevenue = todayEmployeeSales.reduce((sum, sale) => sum + sale.total, 0);
            
            const branchProducts = await Product.find({ addedBy: req.session.user.id });
            const totalBranchProducts = branchProducts.length;
            const lowStockBranchProducts = branchProducts.filter(product => 
                product.stock <= product.reorderLevel
            ).length;
            
            ownBranchReport = {
                employee: currentUser,
                branchStats: {
                    totalProducts: totalBranchProducts,
                    lowStockProducts: lowStockBranchProducts,
                    todaySales: todayEmployeeSales.length,
                    todayRevenue: todayEmployeeRevenue,
                    totalRevenue: employeeTotalRevenue
                },
                totalSales: employeeSales.length,
                totalRevenue: employeeTotalRevenue,
                todaySales: todayEmployeeSales.length,
                todayRevenue: todayEmployeeRevenue
            };
        }

        res.render('dashboard', {
            stats: {
                totalProducts,
                lowStockProducts,
                expiringProducts,
                expiredProducts,
                todaySales: todaySales.length,
                todayRevenue,
                totalRevenue
            },
            recentSales,
            employeeReports,
            ownBranchReport,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/login');
    }
});

module.exports = router;
