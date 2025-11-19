const jwt = require('jsonwebtoken');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        // Verify JWT token if exists
        const token = req.cookies.authToken || req.session.user.token;
        if (token) {
            try {
                jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
            } catch (err) {
                req.session.destroy();
                req.flash('error_msg', 'Session expired. Please login again');
                return res.redirect('/login');
            }
        }
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/login');
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'You do not have permission to access this page');
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
    redirectIfAuthenticated
};
