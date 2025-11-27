const jwt = require('jsonwebtoken');

// Middleware to prevent caching of protected pages
const noCacheMiddleware = (req, res, next) => {
    // Set headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    // Apply no-cache headers to all authenticated routes
    noCacheMiddleware(req, res, () => {});
    
    if (req.session.user) {
        // Verify JWT token if exists
        const token = req.cookies.authToken || req.session.user.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
                
                // Ensure session matches token
                if (decoded.id !== req.session.user.id.toString()) {
                    req.session.destroy();
                    req.flash('error_msg', 'Session mismatch. Please login again');
                    return res.redirect('/login');
                }
            } catch (err) {
                req.session.destroy();
                res.clearCookie('authToken');
                req.flash('error_msg', 'Session expired. Please login again');
                return res.redirect('/login');
            }
        }
        return next();
    }
    
    // AJAX request - return JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required',
            redirectUrl: '/login'
        });
    }
    
    // Regular request - redirect to login
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/login');
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    
    // AJAX request - return JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required',
            redirectUrl: '/dashboard'
        });
    }
    
    // Regular request - redirect to dashboard
    req.flash('error_msg', 'You do not have permission to access this page');
    res.redirect('/dashboard');
};

// Check if user is employee/staff
const isEmployee = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'staff') {
        return next();
    }
    
    // AJAX request - return JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(403).json({ 
            success: false, 
            message: 'Employee access required',
            redirectUrl: '/dashboard'
        });
    }
    
    // Regular request
    req.flash('error_msg', 'This page is for employees only');
    res.redirect('/dashboard');
};

// Redirect if already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isEmployee,
    redirectIfAuthenticated,
    noCacheMiddleware
};
