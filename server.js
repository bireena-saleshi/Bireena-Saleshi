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

const app = express();

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
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(flash());

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
