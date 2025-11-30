require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./backend/config/database');
const { addTimezoneToLocals } = require('./backend/utils/timezone');

const app = express();

// Disable console.log in production for security
if (process.env.NODE_ENV === 'production') {
    console.log = function() {};
}

// Security Headers
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Disable client-side caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    // Remove server header
    res.removeHeader('X-Powered-By');
    next();
});

// Disable x-powered-by header
app.disable('x-powered-by');

// Import routes
const authRoutes = require('./backend/routes/auth');
const dashboardRoutes = require('./backend/routes/dashboard');
const inventoryRoutes = require('./backend/routes/inventory');
const salesRoutes = require('./backend/routes/sales');
const discountRoutes = require('./backend/routes/discount');
const billRoutes = require('./backend/routes/bill');
const reportsRoutes = require('./backend/routes/reports');
const employeesRoutes = require('./backend/routes/employees');
const employeeActivityRoutes = require('./backend/routes/employee-activity');
const contactRoutes = require('./backend/routes/contact');
const profileRoutes = require('./backend/routes/profile');
const inventoryReportRoutes = require('./backend/routes/inventory-report');
const expenseRoutes = require('./backend/routes/expenses');

// MongoDB connection for serverless
if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    // Serverless environment - connect on demand per route
    console.log('🔧 Running in serverless mode');
} else {
    // Local development - connect immediately
    connectDB().catch(err => {
        console.error('❌ Failed to connect to MongoDB:', err);
    });
}

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use('/components', express.static(path.join(__dirname, 'frontend/components')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict' // CSRF protection
    }
}));

app.use(flash());

// Timezone helper middleware (adds formatToIST, formatForBill to all EJS views)
app.use(addTimezoneToLocals);

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/sales', salesRoutes);
app.use('/discount', discountRoutes);
app.use('/bill', billRoutes);
app.use('/reports', reportsRoutes);
app.use('/employees', employeesRoutes);
app.use('/employee-activity', employeeActivityRoutes);
app.use('/contact', contactRoutes);
app.use('/api/contact', contactRoutes);
app.use('/profile', profileRoutes);
app.use('/inventory-report', inventoryReportRoutes);
app.use('/expenses', expenseRoutes);

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

// Export for Vercel
module.exports = app;
