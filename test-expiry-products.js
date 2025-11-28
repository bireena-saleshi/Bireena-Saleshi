// Test Script to Add Products with Expiry Dates
// Run this after restarting your server

const testProducts = [
    {
        name: "Test Cake - Expiring Tomorrow",
        category: "Bakery",
        price: 250,
        stock: 10,
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
    },
    {
        name: "Test Bread - Expiring in 15 Days",
        category: "Bakery", 
        price: 50,
        stock: 20,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
    },
    {
        name: "Test Cookies - Expiring in 30 Days",
        category: "Bakery",
        price: 100,
        stock: 15,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    {
        name: "Test Pastry - Already Expired",
        category: "Bakery",
        price: 150,
        stock: 5,
        expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
        name: "Test Muffins - Fresh (60 days)",
        category: "Bakery",
        price: 80,
        stock: 25,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
    }
];

// How to test:
// 1. Go to http://localhost:3000/inventory/add
// 2. Add these products manually with the specified expiry dates
// 3. Check dashboard - should see expiry alerts
// 4. Check inventory - should see colored badges
// 5. Use filters to view expiring/expired products

console.log("Test Products to Add:");
testProducts.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Expiry Date: ${product.expiryDate.toLocaleDateString()}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Price: ₹${product.price}`);
    console.log(`   Stock: ${product.stock}`);
});
