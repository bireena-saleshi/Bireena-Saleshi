/**
 * GST Settings Setup Script
 * Run this script to initialize GST settings in your database
 * Usage: node setup-gst-settings.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bireena_bakery')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

const gstSettingsSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    gstin: { type: String, required: true },
    stateCode: { type: String, required: true },
    stateName: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    defaultCGSTRate: { type: Number, default: 2.5 },
    defaultSGSTRate: { type: Number, default: 2.5 },
    defaultIGSTRate: { type: Number, default: 5 },
    enableGST: { type: Boolean, default: true },
    gstIncludedInPrice: { type: Boolean, default: true },
    defaultHSNCode: { type: String, default: '19059020' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const GSTSettings = mongoose.model('GSTSettings', gstSettingsSchema);

async function setupGSTSettings() {
    try {
        // Check if settings already exist
        const existing = await GSTSettings.findOne();
        
        if (existing) {
            console.log('⚠️  GST Settings already exist!');
            console.log('Current Settings:');
            console.log('Business Name:', existing.businessName);
            console.log('GSTIN:', existing.gstin);
            console.log('State:', existing.stateName);
            console.log('\nTo update, delete existing settings first or update manually.');
            process.exit(0);
        }

        // Create default settings
        const defaultSettings = new GSTSettings({
            businessName: 'Bireena Bakery',
            gstin: '27XXXXX0000X1Z5', // Replace with your actual GSTIN
            stateCode: '27', // Maharashtra state code (update as needed)
            stateName: 'Maharashtra', // Update as needed
            address: 'Your Business Address', // Update with actual address
            pincode: '400001', // Update with actual pincode
            defaultCGSTRate: 2.5,
            defaultSGSTRate: 2.5,
            defaultIGSTRate: 5,
            enableGST: true,
            gstIncludedInPrice: true,
            defaultHSNCode: '19059020' // HSN for bakery products
        });

        await defaultSettings.save();

        console.log('✅ GST Settings created successfully!');
        console.log('\n📋 Default Settings:');
        console.log('Business Name:', defaultSettings.businessName);
        console.log('GSTIN:', defaultSettings.gstin);
        console.log('State:', defaultSettings.stateName);
        console.log('CGST Rate:', defaultSettings.defaultCGSTRate + '%');
        console.log('SGST Rate:', defaultSettings.defaultSGSTRate + '%');
        console.log('IGST Rate:', defaultSettings.defaultIGSTRate + '%');
        console.log('HSN Code:', defaultSettings.defaultHSNCode);
        console.log('\n⚠️  IMPORTANT: Update the GSTIN and address with your actual business details!');
        console.log('You can update these settings in the database or through the admin panel.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up GST settings:', error);
        process.exit(1);
    }
}

// Run setup
setupGSTSettings();
