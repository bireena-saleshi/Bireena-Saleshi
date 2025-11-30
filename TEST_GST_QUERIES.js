// Quick MongoDB queries for testing GST

// 1. Check GST Settings
db.gstsettings.findOne()

// 2. View all sales with GST
db.sales.find({ totalGST: { $gt: 0 } }).pretty()

// 3. Count B2B vs B2C
db.sales.aggregate([
  { $group: { _id: "$customerType", count: { $sum: 1 }, total: { $sum: "$total" } } }
])

// 4. View latest sale with full GST details
db.sales.findOne({}, { customerType: 1, customerGSTIN: 1, totalGST: 1, totalCGST: 1, totalSGST: 1, totalIGST: 1, isInterState: 1 }).sort({ createdAt: -1 })

// 5. Update test GSTIN (for actual business)
db.gstsettings.updateOne({}, {
  $set: {
    gstin: "YOUR_ACTUAL_GSTIN",
    businessName: "Your Business Name",
    address: "Your Address",
    pincode: "Your Pincode"
  }
})

// 6. Disable GST temporarily (for testing without GST)
db.gstsettings.updateOne({}, { $set: { enableGST: false } })

// 7. Enable GST back
db.gstsettings.updateOne({}, { $set: { enableGST: true } })

// 8. Change tax rates (if needed)
db.gstsettings.updateOne({}, {
  $set: {
    defaultCGSTRate: 2.5,
    defaultSGSTRate: 2.5,
    defaultIGSTRate: 5
  }
})
