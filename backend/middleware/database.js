const connectDB = require('../config/database');

/**
 * Middleware to ensure database connection before processing requests
 * Use this on routes that need database access
 */
const ensureDBConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        
        // Check if request expects JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection error. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } else {
            // For page requests, render an error page
            return res.status(500).render('error', {
                title: 'Error',
                message: 'Unable to connect to database. Please try again later.',
                user: req.session.user || null
            });
        }
    }
};

module.exports = { ensureDBConnection };
