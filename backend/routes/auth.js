const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { redirectIfAuthenticated, isAuthenticated, isAdmin } = require('../middleware/auth');

// Login page
router.get('/', (req, res) => {
    res.render('home');
});

router.get('/features', (req, res) => {
    res.render('features', { title: 'Features - Bireena Saleshi' });
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us - Bireena Saleshi' });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'About - Bireena Saleshi' });
});

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login');
});

// ==================== ADMIN LOGIN ====================
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find admin user
        let admin = await User.findOne({ 
            username: username.toLowerCase(), 
            role: 'admin',
            isActive: true 
        });

        // If no admin exists, create default admin
        if (!admin) {
            const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
            const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

            if (username.toLowerCase() === defaultAdminUsername.toLowerCase()) {
                try {
                    admin = new User({
                        fullName: 'Administrator',
                        username: defaultAdminUsername.toLowerCase(),
                        password: defaultAdminPassword,
                        role: 'admin',
                        isActive: true
                    });
                    await admin.save();
                    console.log('✓ Default admin account created');
                } catch (saveError) {
                    // If duplicate key error, admin was just created, fetch it
                    if (saveError.code === 11000) {
                        admin = await User.findOne({ 
                            username: defaultAdminUsername.toLowerCase(), 
                            role: 'admin' 
                        });
                        if (!admin) {
                            return res.status(401).json({ 
                                success: false, 
                                message: 'Invalid admin credentials' 
                            });
                        }
                    } else {
                        throw saveError;
                    }
                }
            } else {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid admin credentials' 
                });
            }
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        // Update last login
        await admin.updateLastLogin();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username,
                role: admin.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '24h' }
        );

        // Create session
        req.session.user = {
            id: admin._id,
            fullName: admin.fullName,
            username: admin.username,
            role: admin.role,
            token: token
        };

        // Set token in cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({ 
            success: true, 
            message: 'Admin login successful',
            redirectUrl: '/dashboard'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred during admin login' 
        });
    }
});

// ==================== EMPLOYEE LOGIN ====================
router.post('/employee/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find employee user (can login with username or email)
        const employee = await User.findOne({ 
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ],
            role: 'staff',
            isActive: true 
        });

        if (!employee) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid employee credentials' 
            });
        }

        // Verify password
        const isPasswordValid = await employee.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid employee credentials' 
            });
        }

        // Update last login
        await employee.updateLastLogin();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: employee._id, 
                username: employee.username,
                email: employee.email,
                role: employee.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '24h' }
        );

        // Create session
        req.session.user = {
            id: employee._id,
            fullName: employee.fullName,
            username: employee.username,
            email: employee.email,
            role: employee.role,
            token: token
        };

        // Set token in cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({ 
            success: true, 
            message: `Welcome back, ${employee.fullName}!`,
            redirectUrl: '/dashboard'
        });

    } catch (error) {
        console.error('Employee login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred during employee login' 
        });
    }
});

// ==================== ADMIN REGISTRATION ====================
router.post('/admin/register', async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, secretKey } = req.body;

        // Secret key verification (optional security layer)
        const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'admin_secret_2024';
        if (secretKey && secretKey !== adminSecretKey) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid admin secret key' 
            });
        }

        // Validation
        if (!fullName || !username || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        // Check if username exists
        const existingUser = await User.findOne({ 
            username: username.toLowerCase() 
        });
        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Create new admin
        const newAdmin = new User({
            fullName,
            username: username.toLowerCase(),
            password,
            role: 'admin',
            isActive: true
        });

        await newAdmin.save();

        res.json({ 
            success: true, 
            message: 'Admin account created successfully',
            redirectUrl: '/login'
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred during admin registration' 
        });
    }
});

// ==================== CREATE EMPLOYEE (Admin Only) ====================
router.post('/employee/create', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { fullName, username, email, phone, password, confirmPassword } = req.body;

        // Validation
        if (!fullName || !username || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, username, email, and password are required' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        // Phone validation (if provided)
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid 10-digit phone number' 
            });
        }

        // Check if username exists
        const existingUsername = await User.findOne({ 
            username: username.toLowerCase() 
        });
        if (existingUsername) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Check if email exists
        const existingEmail = await User.findOne({ 
            email: email.toLowerCase() 
        });
        if (existingEmail) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        // Create new employee
        const newEmployee = new User({
            fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            phone,
            password,
            role: 'staff',
            isActive: true,
            createdBy: req.session.user.id
        });

        await newEmployee.save();

        res.json({ 
            success: true, 
            message: `Employee ${fullName} created successfully`,
            employee: {
                id: newEmployee._id,
                fullName: newEmployee.fullName,
                username: newEmployee.username,
                email: newEmployee.email,
                phone: newEmployee.phone
            }
        });

    } catch (error) {
        console.error('Employee creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while creating employee' 
        });
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

// ==================== LOGOUT ====================
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

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.clearCookie('authToken');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

module.exports = router;
