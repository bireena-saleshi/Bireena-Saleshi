/**
 * GST Test Sales Generator
 * Creates sample sales for testing GST functionality
 * Usage: node test-gst-sales.js
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

const saleSchema = new mongoose.Schema({
    billNumber: String,
    items: Array,
    total: Number,
    customerName: String,
    customerType: String,
    customerGSTIN: String,
    placeOfSupply: String,
    isInterState: Boolean,
    totalTaxableAmount: Number,
    totalCGST: Number,
    totalSGST: Number,
    totalIGST: Number,
    totalGST: Number,
    createdAt: Date,
    createdBy: mongoose.Schema.Types.ObjectId
});

const Sale = mongoose.model('Sale', saleSchema);

async function createTestSales() {
    try {
        console.log('🧪 Creating test sales for GST...\n');

        // Get admin user
        const User = mongoose.model('User', new mongoose.Schema({ role: String }));
        const admin = await User.findOne({ role: 'admin' });
        
        if (!admin) {
            console.error('❌ Admin user not found. Please create admin first.');
            process.exit(1);
        }

        const testSales = [
            // Test 1: B2C Sale (Regular customer)
            {
                billNumber: `TEST-B2C-${Date.now()}`,
                customerName: 'Walk-in Customer',
                customerType: 'B2C',
                items: [
                    {
                        name: 'Chocolate Cake',
                        quantity: 2,
                        price: 200,
                        subtotal: 400,
                        hsnCode: '19059020',
                        taxableAmount: 380.95,
                        cgstRate: 2.5,
                        cgstAmount: 9.52,
                        sgstRate: 2.5,
                        sgstAmount: 9.53,
                        igstRate: 0,
                        igstAmount: 0
                    }
                ],
                totalTaxableAmount: 380.95,
                totalCGST: 9.52,
                totalSGST: 9.53,
                totalIGST: 0,
                totalGST: 19.05,
                total: 400,
                isInterState: false,
                createdBy: admin._id,
                createdAt: new Date()
            },

            // Test 2: B2B Same State (CGST + SGST)
            {
                billNumber: `TEST-B2B-INTRA-${Date.now()}`,
                customerName: 'Maharashtra Traders Pvt Ltd',
                customerType: 'B2B',
                customerGSTIN: '27AABCT1234C1Z5',
                placeOfSupply: 'Maharashtra',
                items: [
                    {
                        name: 'Pastry Box (12 pcs)',
                        quantity: 5,
                        price: 500,
                        subtotal: 2500,
                        hsnCode: '19059020',
                        taxableAmount: 2500,
                        cgstRate: 2.5,
                        cgstAmount: 62.50,
                        sgstRate: 2.5,
                        sgstAmount: 62.50,
                        igstRate: 0,
                        igstAmount: 0
                    }
                ],
                totalTaxableAmount: 2500,
                totalCGST: 62.50,
                totalSGST: 62.50,
                totalIGST: 0,
                totalGST: 125,
                total: 2625,
                isInterState: false,
                createdBy: admin._id,
                createdAt: new Date()
            },

            // Test 3: B2B Different State (IGST)
            {
                billNumber: `TEST-B2B-INTER-${Date.now()}`,
                customerName: 'Delhi Distributors Ltd',
                customerType: 'B2B',
                customerGSTIN: '07AABCT5678D1Z5',
                placeOfSupply: 'Delhi',
                items: [
                    {
                        name: 'Birthday Cake Special',
                        quantity: 3,
                        price: 800,
                        subtotal: 2400,
                        hsnCode: '19059020',
                        taxableAmount: 2400,
                        cgstRate: 0,
                        cgstAmount: 0,
                        sgstRate: 0,
                        sgstAmount: 0,
                        igstRate: 5,
                        igstAmount: 120
                    }
                ],
                totalTaxableAmount: 2400,
                totalCGST: 0,
                totalSGST: 0,
                totalIGST: 120,
                totalGST: 120,
                total: 2520,
                isInterState: true,
                createdBy: admin._id,
                createdAt: new Date()
            },

            // Test 4: Another B2B Different State
            {
                billNumber: `TEST-B2B-KA-${Date.now()}`,
                customerName: 'Bangalore Bakery Supplies',
                customerType: 'B2B',
                customerGSTIN: '29AABCT9999K1Z5',
                placeOfSupply: 'Karnataka',
                items: [
                    {
                        name: 'Bread Loaves',
                        quantity: 50,
                        price: 40,
                        subtotal: 2000,
                        hsnCode: '19051000',
                        taxableAmount: 2000,
                        cgstRate: 0,
                        cgstAmount: 0,
                        sgstRate: 0,
                        sgstAmount: 0,
                        igstRate: 5,
                        igstAmount: 100
                    }
                ],
                totalTaxableAmount: 2000,
                totalCGST: 0,
                totalSGST: 0,
                totalIGST: 100,
                totalGST: 100,
                total: 2100,
                isInterState: true,
                createdBy: admin._id,
                createdAt: new Date()
            },

            // Test 5: Multiple B2C Sales
            {
                billNumber: `TEST-B2C-2-${Date.now()}`,
                customerName: 'Retail Customer',
                customerType: 'B2C',
                items: [
                    {
                        name: 'Cookies Pack',
                        quantity: 10,
                        price: 50,
                        subtotal: 500,
                        hsnCode: '19059010',
                        taxableAmount: 476.19,
                        cgstRate: 2.5,
                        cgstAmount: 11.90,
                        sgstRate: 2.5,
                        sgstAmount: 11.91,
                        igstRate: 0,
                        igstAmount: 0
                    }
                ],
                totalTaxableAmount: 476.19,
                totalCGST: 11.90,
                totalSGST: 11.91,
                totalIGST: 0,
                totalGST: 23.81,
                total: 500,
                isInterState: false,
                createdBy: admin._id,
                createdAt: new Date()
            }
        ];

        // Insert test sales
        for (const sale of testSales) {
            const newSale = new Sale(sale);
            await newSale.save();
            console.log(`✅ Created: ${sale.billNumber} (${sale.customerType}) - ₹${sale.total}`);
        }

        console.log('\n🎉 Test sales created successfully!');
        console.log('\n📊 Summary:');
        console.log('- B2C Sales: 2');
        console.log('- B2B Intra-State Sales: 1 (CGST + SGST)');
        console.log('- B2B Inter-State Sales: 2 (IGST)');
        console.log('\n✅ You can now:');
        console.log('1. View sales in Dashboard');
        console.log('2. Check GST Reports: http://localhost:3000/gst-reports');
        console.log('3. View individual bills');
        console.log('4. Export CSV for testing');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test sales:', error);
        process.exit(1);
    }
}

createTestSales();
