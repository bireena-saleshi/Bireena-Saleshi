const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Sale = require('../models/Sale');
const { getGSTSettings } = require('../utils/gst-calculator');

// GST Report - GSTR-1 format data
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, customerType } = req.query;
        
        // Build filter
        let filter = { isCancelled: false };
        
        // Date range filter
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            filter.createdAt = { $gte: start, $lte: end };
        }
        
        // Customer type filter
        if (customerType && customerType !== 'all') {
            filter.customerType = customerType;
        }
        
        // Admin sees all, staff sees only their sales
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        // Fetch sales with GST
        const sales = await Sale.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'fullName username branch');
        
        // Calculate GST summary
        let totalB2CSales = 0;
        let totalB2BSales = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        let totalGST = 0;
        let totalTaxableAmount = 0;
        let intraSaleCount = 0;
        let interSaleCount = 0;
        
        const b2bSales = [];
        const b2cSales = [];
        
        sales.forEach(sale => {
            if (sale.customerType === 'B2B') {
                totalB2BSales += sale.total;
                b2bSales.push(sale);
            } else {
                totalB2CSales += sale.total;
                b2cSales.push(sale);
            }
            
            totalTaxableAmount += sale.totalTaxableAmount || 0;
            totalCGST += sale.totalCGST || 0;
            totalSGST += sale.totalSGST || 0;
            totalIGST += sale.totalIGST || 0;
            totalGST += sale.totalGST || 0;
            
            if (sale.isInterState) {
                interSaleCount++;
            } else {
                intraSaleCount++;
            }
        });
        
        // Get GST settings
        const gstSettings = await getGSTSettings();
        
        res.render('reports/gst-report', {
            sales,
            b2bSales,
            b2cSales,
            summary: {
                totalB2CSales: totalB2CSales.toFixed(2),
                totalB2BSales: totalB2BSales.toFixed(2),
                totalSales: (totalB2CSales + totalB2BSales).toFixed(2),
                totalTaxableAmount: totalTaxableAmount.toFixed(2),
                totalCGST: totalCGST.toFixed(2),
                totalSGST: totalSGST.toFixed(2),
                totalIGST: totalIGST.toFixed(2),
                totalGST: totalGST.toFixed(2),
                intraSaleCount,
                interSaleCount,
                totalSaleCount: sales.length,
                b2bCount: b2bSales.length,
                b2cCount: b2cSales.length
            },
            gstSettings,
            filters: { startDate, endDate, customerType: customerType || 'all' },
            page: 'gst-reports'
        });
    } catch (error) {
        console.error('GST Report error:', error);
        req.flash('error_msg', 'Error loading GST report');
        res.redirect('/dashboard');
    }
});

// Export GST data as CSV
router.get('/export', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, customerType } = req.query;
        
        let filter = { isCancelled: false };
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            filter.createdAt = { $gte: start, $lte: end };
        }
        
        if (customerType && customerType !== 'all') {
            filter.customerType = customerType;
        }
        
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sales = await Sale.find(filter)
            .sort({ createdAt: 1 })
            .populate('createdBy', 'fullName username');
        
        // Generate CSV
        let csv = 'Bill Number,Date,Customer Name,Customer Type,GSTIN,Place of Supply,Taxable Amount,CGST,SGST,IGST,Total GST,Total Amount,Transaction Type\n';
        
        sales.forEach(sale => {
            const date = new Date(sale.createdAt).toLocaleDateString('en-IN');
            const transType = sale.isInterState ? 'Inter-State' : 'Intra-State';
            
            csv += `${sale.billNumber},${date},"${sale.customerName}",${sale.customerType},${sale.customerGSTIN || 'N/A'},${sale.placeOfSupply || 'N/A'},${sale.totalTaxableAmount || 0},${sale.totalCGST || 0},${sale.totalSGST || 0},${sale.totalIGST || 0},${sale.totalGST || 0},${sale.total},${transType}\n`;
        });
        
        // Set headers for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="gst-report-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('GST Export error:', error);
        req.flash('error_msg', 'Error exporting GST data');
        res.redirect('/gst-reports');
    }
});

module.exports = router;
