// Script to Normalize Branch Names in Database
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./backend/models/Product');

async function normalizeBranchNames() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products`);

        let updatedCount = 0;
        
        for (const product of products) {
            let normalizedBranch = product.branch || 'Main Branch';
            
            // Normalize common variations
            const branchLower = normalizedBranch.toLowerCase().trim();
            
            if (branchLower === 'admin' || branchLower === 'owner' || branchLower === '' || !product.branch) {
                normalizedBranch = 'Main Branch';
            } else {
                // Capitalize first letter of each word
                normalizedBranch = normalizedBranch
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            }
            
            if (product.branch !== normalizedBranch) {
                console.log(`  📝 ${product.name}: "${product.branch}" → "${normalizedBranch}"`);
                product.branch = normalizedBranch;
                await product.save();
                updatedCount++;
            }
        }

        console.log(`\n✅ Updated ${updatedCount} products`);
        console.log('🚀 Branch names normalized successfully!');
        
        // Show unique branches after normalization
        const uniqueBranches = await Product.distinct('branch');
        console.log('\n📊 Unique branches in database:');
        uniqueBranches.forEach(b => console.log(`  - ${b}`));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

normalizeBranchNames();
