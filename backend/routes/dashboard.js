const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Dashboard home
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get statistics
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({ 
            $expr: { $lte: ['$stock', '$reorderLevel'] } 
        });

        // Today's sales
        const todaySales = await Sale.find({ 
            createdAt: { $gte: today } 
        });
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

        // Total revenue
        const allSales = await Sale.find();
        const totalRevenue = allSales.reduce((sum, sale) => sum + sale.total, 0);

        // Recent sales
        const recentSales = await Sale.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('items.product');

        res.render('dashboard', {
            stats: {
                totalProducts,
                lowStockProducts,
                todaySales: todaySales.length,
                todayRevenue,
                totalRevenue
            },
            recentSales
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/login');
    }
});

module.exports = router;
