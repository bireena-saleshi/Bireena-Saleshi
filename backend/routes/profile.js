const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Profile view page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select('-password');
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/dashboard');
        }

        res.render('profile/view', {
            title: 'My Profile',
            user: user,
            session: req.session
        });
    } catch (error) {
        console.error('Profile view error:', error);
        req.flash('error_msg', 'Error loading profile');
        res.redirect('/dashboard');
    }
});

// Profile edit page
router.get('/edit', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select('-password');
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/dashboard');
        }

        res.render('profile/edit', {
            title: 'Edit Profile',
            user: user,
            session: req.session
        });
    } catch (error) {
        console.error('Profile edit page error:', error);
        req.flash('error_msg', 'Error loading profile edit page');
        res.redirect('/profile');
    }
});

// Update profile
router.post('/update', isAuthenticated, async (req, res) => {
    try {
        const { fullName, email, phone, shopName, shopGST, shopAddress } = req.body;

        // Validate required fields
        if (!fullName || !email) {
            req.flash('error_msg', 'Name and email are required');
            return res.redirect('/profile/edit');
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            req.flash('error_msg', 'Please enter a valid email address');
            return res.redirect('/profile/edit');
        }

        // Validate phone number if provided
        if (phone && phone.trim() !== '') {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                req.flash('error_msg', 'Phone number must be exactly 10 digits');
                return res.redirect('/profile/edit');
            }
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
            email: email.toLowerCase(), 
            _id: { $ne: req.session.user.id } 
        });

        if (existingUser) {
            req.flash('error_msg', 'Email is already in use by another account');
            return res.redirect('/profile/edit');
        }

        // Update user profile
        const updateData = {
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone && phone.trim() !== '' ? phone.trim() : null,
            shopName: shopName && shopName.trim() !== '' ? shopName.trim() : null,
            shopGST: shopGST && shopGST.trim() !== '' ? shopGST.trim() : null,
            shopAddress: shopAddress && shopAddress.trim() !== '' ? shopAddress.trim() : null,
            updatedAt: Date.now()
        };

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/profile/edit');
        }

        // Update session
        req.session.user.fullName = updatedUser.fullName;
        req.session.user.email = updatedUser.email;

        // Auto-sync with GST Settings (if admin and shop details provided)
        if (req.session.user.role === 'admin' && shopName && shopGST) {
            try {
                const GSTSettings = require('../models/GSTSettings');
                const gstSettings = await GSTSettings.findOne();
                
                if (gstSettings) {
                    // Extract state code from GSTIN
                    let stateCode = gstSettings.stateCode;
                    if (shopGST && shopGST.length >= 2) {
                        stateCode = shopGST.substring(0, 2);
                    }
                    
                    await GSTSettings.updateOne({}, {
                        $set: {
                            businessName: shopName.trim(),
                            gstin: shopGST.trim(),
                            address: shopAddress ? shopAddress.trim() : gstSettings.address,
                            stateCode: stateCode,
                            updatedAt: new Date()
                        }
                    });
                    console.log('✅ GST Settings auto-synced with profile data');
                }
            } catch (syncError) {
                console.error('⚠️ GST Settings sync error:', syncError);
                // Don't fail the update if sync fails
            }
        }

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        req.flash('error_msg', error.message || 'Error updating profile');
        res.redirect('/profile/edit');
    }
});

// Change password page (Admin only)
router.get('/change-password', isAuthenticated, isAdmin, async (req, res) => {
    try {
        res.render('profile/change-password', {
            title: 'Change Password',
            session: req.session
        });
    } catch (error) {
        console.error('Change password page error:', error);
        req.flash('error_msg', 'Error loading change password page');
        res.redirect('/profile');
    }
});

// Update password (Admin only)
router.post('/change-password', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            req.flash('error_msg', 'All password fields are required');
            return res.redirect('/profile/change-password');
        }

        if (newPassword !== confirmPassword) {
            req.flash('error_msg', 'New passwords do not match');
            return res.redirect('/profile/change-password');
        }

        if (newPassword.length < 6) {
            req.flash('error_msg', 'New password must be at least 6 characters long');
            return res.redirect('/profile/change-password');
        }

        // Get user with password
        const user = await User.findById(req.session.user.id);

        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/profile/change-password');
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash('error_msg', 'Current password is incorrect');
            return res.redirect('/profile/change-password');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        req.flash('success_msg', 'Password changed successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error('Change password error:', error);
        req.flash('error_msg', 'Error changing password');
        res.redirect('/profile/change-password');
    }
});

module.exports = router;
