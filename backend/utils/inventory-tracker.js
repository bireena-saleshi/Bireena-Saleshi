const DailyInventoryReport = require('../models/DailyInventoryReport');
const Product = require('../models/Product');

/**
 * Update daily inventory report when product is added to inventory
 */
async function trackProductAddition(productId, quantity, productName, unit, category) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get product prices
        const product = await Product.findById(productId);
        if (!product) return;
        
        const purchasePrice = product.purchasePrice || 0;
        const sellingPrice = product.sellingPrice || product.price || 0;
        
        // Find or create today's report for this product
        let report = await DailyInventoryReport.findOne({
            productId: productId,
            date: today
        });
        
        if (report) {
            // Update existing report
            report.additions += quantity;
            report.closingStock += quantity;
            report.purchasePrice = purchasePrice;
            report.sellingPrice = sellingPrice;
            await report.save();
        } else {
            // Get previous day's closing stock
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const previousReport = await DailyInventoryReport.findOne({
                productId: productId,
                date: yesterday,
                branch: branch
            });
            
            const openingStock = previousReport ? previousReport.closingStock : (product.stock - quantity);
            
            // Create new report
            await DailyInventoryReport.create({
                date: today,
                productId: productId,
                productName: productName,
                openingStock: openingStock,
                additions: quantity,
                sales: 0,
                damage: 0,
                closingStock: openingStock + quantity,
                unit: unit,
                category: category,
                purchasePrice: purchasePrice,
                sellingPrice: sellingPrice,
                branch: branch
            });
        }
    } catch (error) {
        console.error('Error tracking product addition:', error);
    }
}

/**
 * Update daily inventory report when product is sold
 */
async function trackProductSale(productId, quantity, productName, unit, category) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get product prices
        const product = await Product.findById(productId);
        if (!product) return;
        
        const purchasePrice = product.purchasePrice || 0;
        const sellingPrice = product.sellingPrice || product.price || 0;
        const branch = product.branch || 'Main Branch';
        
        // Find or create today's report for this product
        let report = await DailyInventoryReport.findOne({
            productId: productId,
            date: today,
            branch: branch
        });
        
        if (report) {
            // Update existing report
            report.sales += quantity;
            report.closingStock -= quantity;
            report.purchasePrice = purchasePrice;
            report.sellingPrice = sellingPrice;
            await report.save();
        } else {
            // Get previous day's closing stock
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const previousReport = await DailyInventoryReport.findOne({
                productId: productId,
                date: yesterday,
                branch: branch
            });
            
            const openingStock = previousReport ? previousReport.closingStock : (product.stock + quantity);
            
            // Create new report
            await DailyInventoryReport.create({
                date: today,
                productId: productId,
                productName: productName,
                openingStock: openingStock,
                additions: 0,
                sales: quantity,
                damage: 0,
                closingStock: openingStock - quantity,
                unit: unit,
                category: category,
                purchasePrice: purchasePrice,
                sellingPrice: sellingPrice,
                branch: branch
            });
        }
    } catch (error) {
        console.error('Error tracking product sale:', error);
    }
}

/**
 * Update daily inventory report when product is damaged
 */
async function trackProductDamage(productId, quantity, productName, unit, category) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get product prices
        const product = await Product.findById(productId);
        if (!product) return;
        
        const purchasePrice = product.purchasePrice || 0;
        const sellingPrice = product.sellingPrice || product.price || 0;
        const branch = product.branch || 'Main Branch';
        
        // Find or create today's report for this product
        let report = await DailyInventoryReport.findOne({
            productId: productId,
            date: today,
            branch: branch
        });
        
        if (report) {
            // Update existing report
            report.damage += quantity;
            report.closingStock -= quantity;
            report.purchasePrice = purchasePrice;
            report.sellingPrice = sellingPrice;
            await report.save();
        } else {
            // Get previous day's closing stock
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const previousReport = await DailyInventoryReport.findOne({
                productId: productId,
                date: yesterday,
                branch: branch
            });
            
            const openingStock = previousReport ? previousReport.closingStock : (product.stock + quantity);
            
            // Create new report
            await DailyInventoryReport.create({
                date: today,
                productId: productId,
                productName: productName,
                openingStock: openingStock,
                additions: 0,
                sales: 0,
                damage: quantity,
                closingStock: openingStock - quantity,
                unit: unit,
                category: category,
                purchasePrice: purchasePrice,
                sellingPrice: sellingPrice,
                branch: branch
            });
        }
    } catch (error) {
        console.error('Error tracking product damage:', error);
    }
}

/**
 * Initialize daily report for a new product
 */
async function initializeProductReport(product) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if report already exists
        const existingReport = await DailyInventoryReport.findOne({
            productId: product._id,
            date: today,
            branch: product.branch || 'Main Branch'
        });
        
        if (!existingReport) {
            await DailyInventoryReport.create({
                date: today,
                productId: product._id,
                productName: product.name,
                openingStock: 0,
                additions: product.stock,
                sales: 0,
                damage: 0,
                closingStock: product.stock,
                unit: product.unit,
                category: product.category,
                purchasePrice: product.purchasePrice || 0,
                sellingPrice: product.sellingPrice || product.price || 0,
                branch: product.branch || 'Main Branch'
            });
        }
    } catch (error) {
        console.error('Error initializing product report:', error);
    }
}

module.exports = {
    trackProductAddition,
    trackProductSale,
    trackProductDamage,
    initializeProductReport
};
