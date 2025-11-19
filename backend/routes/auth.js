const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Login page
router.get('/', redirectIfAuthenticated, (req, res) => {
    res.render('login');
});

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login');
});

// Login handler
router.post('/login', async (req, res) => {
    try {
        const { username, email, password, loginType } = req.body;

        let user;

        // Admin login with username
        if (loginType === 'admin') {
            user = await User.findOne({ username, role: 'admin' });

            // If no admin exists, create default admin
            if (!user) {
                const adminUsername = process.env.ADMIN_USERNAME || 'admin';
                const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

                if (username === adminUsername) {
                    user = new User({
                        username: adminUsername,
                        password: adminPassword,
                        role: 'admin'
                    });
                    await user.save();
                    console.log('Default admin created');
                } else {
                    req.flash('error_msg', 'Invalid admin credentials');
                    return res.redirect('/login');
                }
            }
        }
        // Employee login with email
        else if (loginType === 'employee') {
            if (!email) {
                req.flash('error_msg', 'Email is required for employee login');
                return res.redirect('/login');
            }
            user = await User.findOne({ email, role: 'staff' });

            if (!user) {
                req.flash('error_msg', 'Invalid employee credentials');
                return res.redirect('/login');
            }
        } else {
            req.flash('error_msg', 'Please select login type');
            return res.redirect('/login');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/login');
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '24h' }
        );

        // Create session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: token
        };

        // Set token in cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        req.flash('success_msg', `Welcome ${user.role === 'admin' ? 'Admin' : user.username}!`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/login');
    }
});

// Register page
router.get('/register', redirectIfAuthenticated, (req, res) => {
    const type = req.query.type || 'employee'; // Default to employee
    res.render('register', { registerType: type });
});

// Register handler
router.post('/register', async (req, res) => {
    try {
        const { fullName, username, email, phone, password, confirmPassword, registerType } = req.body;

        // Validation
        if (!fullName || !username || !email || !password || !confirmPassword) {
            req.flash('error_msg', 'Name, username, email, and password are required');
            return res.redirect(`/register?type=${registerType || 'employee'}`);
        }

        // Phone validation
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            req.flash('error_msg', 'Please enter a valid 10-digit phone number');
            return res.redirect(`/register?type=${registerType || 'employee'}`);
        }

        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect(`/register?type=${registerType || 'employee'}`);
        }

        if (password.length < 6) {
            req.flash('error_msg', 'Password must be at least 6 characters');
            return res.redirect(`/register?type=${registerType || 'employee'}`);
        }

        // Check if username exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            req.flash('error_msg', 'Username already taken');
            return res.redirect(`/register?type=${registerType || 'employee'}`);
        }

        // Check if email exists (for employee)
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                req.flash('error_msg', 'Email already registered');
                return res.redirect(`/register?type=${registerType || 'employee'}`);
            }
        }

        // Determine role
        const role = registerType === 'admin' ? 'admin' : 'staff';

        // Create new user
        const userData = {
            fullName,
            username,
            email,
            phone: phone || '',
            password,
            role
        };

        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '24h' }
        );

        // Create session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: token
        };

        // Set token in cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        req.flash('success_msg', `Registration successful! Welcome ${role === 'admin' ? 'Admin' : 'to the team'}!`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Error during registration');
        res.redirect('/register');
    }
});

// Forgot password page
router.get('/forgot-password', redirectIfAuthenticated, (req, res) => {
    res.render('forgot-password');
});

// Forgot password handler
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            req.flash('error_msg', 'Email is required');
            return res.redirect('/forgot-password');
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'No account found with that email');
            return res.redirect('/forgot-password');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // In production, send email with reset link
        // For now, display token in flash message
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        
        req.flash('success_msg', `Password reset link: ${resetUrl} (Valid for 1 hour)`);
        res.redirect('/login');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error_msg', 'Error processing request');
        res.redirect('/forgot-password');
    }
});

// Reset password page
router.get('/reset-password/:token', (req, res) => {
    res.render('reset-password', { token: req.params.token });
});

// Reset password handler
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { token } = req.params;

        if (!password || !confirmPassword) {
            req.flash('error_msg', 'All fields are required');
            return res.redirect(`/reset-password/${token}`);
        }

        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect(`/reset-password/${token}`);
        }

        if (password.length < 6) {
            req.flash('error_msg', 'Password must be at least 6 characters');
            return res.redirect(`/reset-password/${token}`);
        }

        // Hash the token from URL
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Invalid or expired reset token');
            return res.redirect('/forgot-password');
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        req.flash('success_msg', 'Password reset successful! Please login with your new password');
        res.redirect('/login');
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error_msg', 'Error resetting password');
        res.redirect('/forgot-password');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.clearCookie('authToken');
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

module.exports = router;
