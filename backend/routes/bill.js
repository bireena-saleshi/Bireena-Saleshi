const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Sale = require('../models/Sale');
const { sendBillSMS } = require('../utils/sms');
const { formatForBill, getDateTimeSeparate } = require('../utils/timezone');

// View bill
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        
        // If user is employee (staff), only allow access to their own branch bills
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter).populate('createdBy', 'username');
        if (!sale) {
            req.flash('error_msg', 'Bill not found or access denied');
            return res.redirect('/sales');
        }
        
        // Format date/time for display in IST
        const displayDateTime = getDateTimeSeparate(sale.createdAt);
        
        res.render('bill/view', { 
            sale,
            displayDate: displayDateTime.date,
            displayTime: displayDateTime.time
        });
    } catch (error) {
        console.error('View bill error:', error);
        req.flash('error_msg', 'Error loading bill');
        res.redirect('/sales');
    }
});

// Print bill
router.get('/print/:id', isAuthenticated, async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        
        // If user is employee (staff), only allow access to their own branch bills
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter).populate('createdBy', 'username');
        if (!sale) {
            req.flash('error_msg', 'Bill not found or access denied');
            return res.redirect('/sales');
        }
        
        // Format date/time for display in IST
        const displayDateTime = getDateTimeSeparate(sale.createdAt);
        
        res.render('bill/print', { 
            sale,
            displayDate: displayDateTime.date,
            displayTime: displayDateTime.time,
            layout: false 
        });
    } catch (error) {
        console.error('Print bill error:', error);
        req.flash('error_msg', 'Error loading bill');
        res.redirect('/sales');
    }
});

// Resend SMS
router.post('/resend-sms/:id', isAuthenticated, async (req, res) => {
    try {
        let filter = { _id: req.params.id };
        
        // If user is employee (staff), only allow access to their own branch bills
        if (req.session.user.role === 'staff') {
            filter.createdBy = req.session.user.id;
        }
        
        const sale = await Sale.findOne(filter);
        if (!sale) {
            req.flash('error_msg', 'Bill not found or access denied');
            return res.redirect('/sales');
        }

        if (!sale.customerPhone || sale.customerPhone.trim() === '') {
            req.flash('error_msg', 'No phone number available');
            return res.redirect(`/bill/${sale._id}`);
        }

        const smsResult = await sendBillSMS(sale.customerPhone, {
            billNumber: sale.billNumber,
            customerName: sale.customerName,
            items: sale.items,
            subtotal: sale.subtotal,
            discountAmount: sale.discount,
            total: sale.total,
            paymentMethod: sale.paymentMethod
        });

        if (smsResult.success) {
            sale.smsSent = true;
            await sale.save();
            req.flash('success_msg', 'SMS sent successfully');
        } else {
            req.flash('error_msg', `Failed to send SMS: ${smsResult.message}`);
        }

        res.redirect(`/bill/${sale._id}`);
    } catch (error) {
        console.error('Resend SMS error:', error);
        req.flash('error_msg', 'Error sending SMS');
        res.redirect('/sales');
    }
});

module.exports = router;
