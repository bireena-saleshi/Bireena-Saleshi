const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// List all employees (Admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employees = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
        res.render('employees/list', { employees });
    } catch (error) {
        console.error('Employee list error:', error);
        req.flash('error_msg', 'Error loading employees');
        res.redirect('/dashboard');
    }
});

// Add employee page (Admin only)
router.get('/add', isAuthenticated, isAdmin, (req, res) => {
    res.render('employees/add');
});

// Create employee (Admin only)
router.post('/add', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { fullName, username, email, phone, password } = req.body;

        // Validation
        if (!fullName || !username || !email || !password) {
            req.flash('error_msg', 'Please fill all required fields');
            return res.redirect('/employees/add');
        }

        // Validate phone if provided
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            req.flash('error_msg', 'Please enter a valid 10-digit phone number');
            return res.redirect('/employees/add');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/employees/add');
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            req.flash('error_msg', 'Username already taken');
            return res.redirect('/employees/add');
        }

        // Create new employee
        const employee = new User({
            fullName,
            username,
            email,
            phone: phone || '',
            password,
            role: 'staff'
        });

        await employee.save();
        
        // Flash success message with employee credentials
        req.flash('success_msg', `Employee ${fullName} added successfully! Employee ID: ${username}`);
        res.redirect('/employees');
    } catch (error) {
        console.error('Add employee error:', error);
        req.flash('error_msg', 'Error adding employee: ' + error.message);
        res.redirect('/employees/add');
    }
});

// Edit employee page (Admin only)
router.get('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);
        if (!employee || employee.role !== 'staff') {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }
        res.render('employees/edit', { employee });
    } catch (error) {
        console.error('Edit employee error:', error);
        req.flash('error_msg', 'Error loading employee');
        res.redirect('/employees');
    }
});

// Update employee (Admin only)
router.post('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { fullName, username, email, phone, password } = req.body;
        const employee = await User.findById(req.params.id);

        if (!employee || employee.role !== 'staff') {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }

        // Validate phone if provided
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            req.flash('error_msg', 'Please enter a valid 10-digit phone number');
            return res.redirect('/employees/edit/' + req.params.id);
        }

        // Update fields
        employee.fullName = fullName;
        employee.username = username;
        employee.email = email;
        employee.phone = phone || '';
        
        // Only update password if provided
        if (password && password.trim() !== '') {
            employee.password = password;
        }

        await employee.save();
        req.flash('success_msg', 'Employee updated successfully');
        res.redirect('/employees');
    } catch (error) {
        console.error('Update employee error:', error);
        req.flash('error_msg', 'Error updating employee');
        res.redirect('/employees/edit/' + req.params.id);
    }
});

// Delete employee (Admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);
        
        if (!employee || employee.role !== 'staff') {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }

        await User.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Employee deleted successfully');
        res.redirect('/employees');
    } catch (error) {
        console.error('Delete employee error:', error);
        req.flash('error_msg', 'Error deleting employee');
        res.redirect('/employees');
    }
});

module.exports = router;
