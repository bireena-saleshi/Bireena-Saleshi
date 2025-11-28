// Script to Update Existing Products' Expiry Status
// Run this once to update all existing products in your database

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./backend/models/Product');

async function updateAllProductsExpiryStatus() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all products with expiry dates
        const products = await Product.find({ expiryDate: { $exists: true, $ne: null } });
        console.log(`📦 Found ${products.length} products with expiry dates`);

        if (products.length === 0) {
            console.log('ℹ️  No products with expiry dates found. Add some products first!');
            process.exit(0);
        }

        const today = new Date();
        let updatedCount = 0;
        let expiringCount = 0;
        let expiredCount = 0;
        let freshCount = 0;

        for (const product of products) {
            const expiry = new Date(product.expiryDate);
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            // Calculate new expirySoon status
            const newExpirySoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
            
            // Update if status changed
            if (product.expirySoon !== newExpirySoon) {
                product.expirySoon = newExpirySoon;
                await product.save();
                updatedCount++;
            }

            // Count by status
            if (daysUntilExpiry < 0) {
                expiredCount++;
                console.log(`  🔴 ${product.name} - EXPIRED (${Math.abs(daysUntilExpiry)} days ago)`);
            } else if (daysUntilExpiry <= 30) {
                expiringCount++;
                console.log(`  🟡 ${product.name} - EXPIRING SOON (${daysUntilExpiry} days left)`);
            } else {
                freshCount++;
                console.log(`  🟢 ${product.name} - FRESH (${daysUntilExpiry} days left)`);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`  ✅ Updated: ${updatedCount} products`);
        console.log(`  🔴 Expired: ${expiredCount} products`);
        console.log(`  🟡 Expiring Soon (≤30 days): ${expiringCount} products`);
        console.log(`  🟢 Fresh (>30 days): ${freshCount} products`);
        console.log('\n✅ All products updated successfully!');
        console.log('🚀 Go to http://localhost:3000/dashboard to see the alerts!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating products:', error);
        process.exit(1);
    }
}

// Run the update
updateAllProductsExpiryStatus();
