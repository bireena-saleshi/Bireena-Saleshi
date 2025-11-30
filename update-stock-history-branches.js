/**
 * Migration Script: Update existing StockHistory entries with branch information
 * Run once: node update-stock-history-branches.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const StockHistory = require('./backend/models/StockHistory');
const Product = require('./backend/models/Product');

async function updateStockHistoryBranches() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all stock history entries without branch or with default branch
        const historyEntries = await StockHistory.find({
            $or: [
                { branch: { $exists: false } },
                { branch: null },
                { branch: '' }
            ]
        });

        console.log(`📊 Found ${historyEntries.length} entries to update`);

        let updated = 0;
        let skipped = 0;

        for (const entry of historyEntries) {
            try {
                // Get the product to find its branch
                const product = await Product.findById(entry.productId);
                
                if (product && product.branch) {
                    entry.branch = product.branch;
                    await entry.save();
                    updated++;
                    
                    if (updated % 10 === 0) {
                        console.log(`✅ Updated ${updated} entries...`);
                    }
                } else {
                    // Set default branch if product not found
                    entry.branch = 'Main Branch';
                    await entry.save();
                    skipped++;
                }
            } catch (err) {
                console.error(`❌ Error updating entry ${entry._id}:`, err.message);
                skipped++;
            }
        }

        console.log('\n🎉 Migration Complete!');
        console.log(`✅ Successfully updated: ${updated} entries`);
        console.log(`⚠️  Set to default: ${skipped} entries`);
        console.log(`📊 Total processed: ${historyEntries.length} entries`);

        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
updateStockHistoryBranches();
