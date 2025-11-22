require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');

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

// MongoDB connection with better timeout for Vercel
const MONGODB_URI = process.env.MONGODB_URI;

console.log('=== MongoDB Connection Debug ===');
console.log('MONGODB_URI exists:', !!MONGODB_URI);
console.log('MONGODB_URI length:', MONGODB_URI ? MONGODB_URI.length : 0);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================================');

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in environment variables!');
    console.error('Available env vars:', Object.keys(process.env).join(', '));
} else {
    console.log('🔄 Connecting to MongoDB...');
    
    // Use async IIFE to await connection
    (async () => {
        try {
            await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 60000, // Increased to 60s for Vercel
                socketTimeoutMS: 75000, // Increased to 75s
                connectTimeoutMS: 60000, // Added connection timeout
                maxPoolSize: 10,
                minPoolSize: 2,
                retryWrites: true,
                retryReads: true,
                w: 'majority'
            });
            console.log('✅ MongoDB connected successfully');
            console.log('Database:', mongoose.connection.db.databaseName);
        } catch (err) {
            console.error('❌ MongoDB connection error:', err.message);
            console.error('Error name:', err.name);
            console.error('Full error stack:', err.stack);
        }
    })();

    // Connection event listeners
    mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected');
    });
}

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));
app.use(express.static(path.join(__dirname, 'frontend/public')));
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
