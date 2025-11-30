# 🧪 GST Testing Guide - Complete Checklist

**System**: Bireena Bakery Management  
**Feature**: GST (Goods and Services Tax)  
**Status**: ✅ Ready for Testing  
**Date**: November 30, 2025

---

## ✅ Quick Start - Test in 5 Minutes

### **Method 1: Automatic Test Data**
```bash
# Step 1: Setup GST (already done ✅)
node setup-gst-settings.js

# Step 2: Create test sales
node test-gst-sales.js

# Step 3: Open browser
http://localhost:3000/gst-reports
```

### **Method 2: Manual Testing**
1. Login to your bakery system
2. Create a sale with customer GSTIN
3. Check the bill
4. View GST Reports

---

## 🎯 What Can You Test

### ✅ **1. B2C Sales (Regular Customers)**
**When**: Customer nahi chahiye GSTIN  
**Expected**: GST automatically included in price

**Test Steps**:
```
1. Dashboard → New Sale
2. Add items: Cake (₹100)
3. Customer Type: B2C
4. Customer Name: "Walk-in Customer"
5. Don't enter GSTIN
6. Complete Sale
7. ✅ Bill should show ₹100 total (GST included)
```

**What to Check**:
- [ ] Total amount correct
- [ ] No GSTIN shown on bill
- [ ] GST included in price
- [ ] Bill prints properly

---

### ✅ **2. B2B Same State (CGST + SGST)**
**When**: Customer same state se hai  
**Expected**: CGST (2.5%) + SGST (2.5%) = 5% total

**Test Steps**:
```
1. Dashboard → New Sale
2. Add items: Cake (₹1000)
3. Customer Type: B2B
4. Customer Name: "Maharashtra Traders"
5. Customer GSTIN: 27AABCT1234C1Z5
6. Complete Sale
7. ✅ Total: ₹1050 (₹1000 + ₹25 CGST + ₹25 SGST)
```

**Sample GSTINs for Same State (Maharashtra = 27)**:
- `27AABCT1234C1Z5`
- `27AACCP1234P1Z5`
- `27AABCD5678D1Z5`

**What to Check**:
- [ ] CGST calculated (₹25)
- [ ] SGST calculated (₹25)
- [ ] IGST is ₹0
- [ ] Total GST = ₹50
- [ ] Bill shows CGST + SGST rows
- [ ] Customer GSTIN printed
- [ ] HSN code shown
- [ ] `isInterState: false` in database

---

### ✅ **3. B2B Different State (IGST)**
**When**: Customer dusre state se hai  
**Expected**: IGST (5%) only

**Test Steps**:
```
1. Dashboard → New Sale
2. Add items: Cake (₹1000)
3. Customer Type: B2B
4. Customer Name: "Delhi Distributors"
5. Customer GSTIN: 07AABCT1234C1Z5
6. Complete Sale
7. ✅ Total: ₹1050 (₹1000 + ₹50 IGST)
```

**Sample GSTINs for Different States**:
| State | GSTIN | Expected |
|-------|-------|----------|
| Delhi | `07AABCT1234C1Z5` | IGST ✅ |
| Karnataka | `29AABCT1234C1Z5` | IGST ✅ |
| Gujarat | `24AABCT1234C1Z5` | IGST ✅ |
| Tamil Nadu | `33AABCT1234C1Z5` | IGST ✅ |
| West Bengal | `19AABCT1234C1Z5` | IGST ✅ |
| UP | `09AABCT1234C1Z5` | IGST ✅ |

**What to Check**:
- [ ] IGST calculated (₹50)
- [ ] CGST is ₹0
- [ ] SGST is ₹0
- [ ] Total GST = ₹50
- [ ] Bill shows IGST row only
- [ ] Customer GSTIN printed
- [ ] HSN code shown
- [ ] `isInterState: true` in database

---

## 📊 GST Reports Testing

### **Test 4: View GST Reports**
```
URL: http://localhost:3000/gst-reports

Steps:
1. Open GST Reports page
2. Select date range (today)
3. Filter: All
4. ✅ Check summary cards
5. ✅ Check B2B table
6. ✅ Check B2C summary
```

**What to Check**:
- [ ] Page loads without error
- [ ] Summary cards show correct data:
  - [ ] Total Sales
  - [ ] B2B Sales count
  - [ ] B2C Sales count
  - [ ] Total GST collected
- [ ] Tax breakdown cards:
  - [ ] Taxable Amount
  - [ ] CGST + SGST
  - [ ] IGST
  - [ ] Intra-State count
  - [ ] Inter-State count
- [ ] B2B Sales Table shows:
  - [ ] Bill Number (clickable)
  - [ ] Date
  - [ ] Customer Name
  - [ ] GSTIN
  - [ ] Place of Supply
  - [ ] Tax amounts
  - [ ] Total
- [ ] B2C Sales Summary shows:
  - [ ] Transaction count
  - [ ] Total amount

---

### **Test 5: Date Range Filter**
```
1. Select Start Date: [Select past date]
2. Select End Date: [Select today]
3. Click "Filter"
4. ✅ Results should filter by date
```

**What to Check**:
- [ ] Filter works correctly
- [ ] Old sales excluded
- [ ] Recent sales included
- [ ] Summary updates

---

### **Test 6: Customer Type Filter**
```
Test A: Filter B2B Only
1. Select Customer Type: B2B
2. Click "Filter"
3. ✅ Only B2B sales shown

Test B: Filter B2C Only
1. Select Customer Type: B2C
2. Click "Filter"
3. ✅ Only B2C sales shown

Test C: Show All
1. Select Customer Type: All
2. Click "Filter"
3. ✅ Both B2B and B2C shown
```

**What to Check**:
- [ ] B2B filter works
- [ ] B2C filter works
- [ ] All filter works
- [ ] Summary cards update
- [ ] Counts correct

---

### **Test 7: CSV Export**
```
1. Apply any filters (optional)
2. Click "Export CSV" button
3. ✅ File downloads
4. Open CSV file
```

**What to Check in CSV**:
- [ ] File downloads successfully
- [ ] Contains columns:
  - [ ] Bill Number
  - [ ] Date
  - [ ] Customer Name
  - [ ] Customer Type
  - [ ] GSTIN
  - [ ] Place of Supply
  - [ ] Taxable Amount
  - [ ] CGST
  - [ ] SGST
  - [ ] IGST
  - [ ] Total GST
  - [ ] Total Amount
  - [ ] Transaction Type
- [ ] Data matches screen
- [ ] Formatting correct
- [ ] Can open in Excel

---

## 🧾 Bill Testing

### **Test 8: Bill Print (B2B)**
```
1. Create B2B sale
2. View bill
3. Click "Print Bill"
4. ✅ Check printed format
```

**What to Check**:
- [ ] Customer Name printed
- [ ] Customer GSTIN printed
- [ ] HSN codes in table
- [ ] Tax breakdown shown:
  - [ ] CGST row (if same state)
  - [ ] SGST row (if same state)
  - [ ] IGST row (if different state)
- [ ] Total tax amount
- [ ] Grand total correct
- [ ] Thermal printer compatible
- [ ] All alignments proper

---

### **Test 9: Bill View Page**
```
1. Go to Sales → View Bills
2. Click any B2B bill
3. ✅ Check details page
```

**What to Check**:
- [ ] B2B badge shown
- [ ] Customer GSTIN displayed
- [ ] HSN codes in item table
- [ ] Tax breakdown before total:
  - [ ] Subtotal
  - [ ] CGST/SGST or IGST
  - [ ] Grand Total
- [ ] All formatting proper

---

## 🔧 Advanced Testing

### **Test 10: GSTIN Validation**
```
Test Invalid GSTIN formats:
1. Too short: 27AABCT1234C1 ❌
2. Too long: 27AABCT1234C1Z5XX ❌
3. Wrong format: AABB1234567890 ❌
4. Special chars: 27@@BCT1234C1Z5 ❌

Test Valid GSTIN:
5. Correct: 27AABCT1234C1Z5 ✅
```

**What to Check**:
- [ ] Invalid GSTINs rejected
- [ ] Error message shown
- [ ] Valid GSTINs accepted
- [ ] State code extracted correctly

---

### **Test 11: State Detection**
```
Test different state codes:
1. Maharashtra (27): CGST + SGST ✅
2. Delhi (07): IGST ✅
3. Karnataka (29): IGST ✅
4. Same state twice: CGST + SGST ✅
```

**What to Check**:
- [ ] State code extracted from GSTIN
- [ ] Compared with seller state
- [ ] Correct tax type applied
- [ ] `isInterState` flag set correctly

---

### **Test 12: Multiple Items**
```
1. Create sale with multiple items:
   - Cake ₹500
   - Pastry ₹300
   - Cookies ₹200
2. Customer Type: B2B
3. GSTIN: 07AABCT1234C1Z5 (Delhi - IGST)
4. ✅ Total: ₹1000 + ₹50 IGST = ₹1050
```

**What to Check**:
- [ ] Each item has HSN code
- [ ] Each item taxed correctly
- [ ] Total tax = sum of all items
- [ ] Bill shows all items with HSN
- [ ] Grand total correct

---

### **Test 13: Discounts with GST**
```
1. Add item: Cake ₹1000
2. Apply discount: 10% = ₹100
3. Customer Type: B2B
4. GSTIN: 27AABCT1234C1Z5 (Same state)
5. ✅ Taxable: ₹900
6. ✅ CGST: ₹22.50
7. ✅ SGST: ₹22.50
8. ✅ Total: ₹945
```

**What to Check**:
- [ ] Discount applied before GST
- [ ] GST calculated on discounted amount
- [ ] Tax amounts correct
- [ ] Total matches

---

## 📱 Database Testing

### **Test 14: Check Database Records**
```bash
# Connect to MongoDB
mongo bireena_bakery

# Check GST settings
db.gstsettings.findOne()

# Check latest sale
db.sales.findOne({}, { customerType: 1, totalGST: 1, totalCGST: 1, totalSGST: 1, totalIGST: 1 }).sort({ createdAt: -1 })

# Count sales by type
db.sales.aggregate([
  { $group: { _id: "$customerType", count: { $sum: 1 } } }
])
```

**What to Check**:
- [ ] GST settings exist
- [ ] enableGST is true
- [ ] Sales have GST fields
- [ ] Tax amounts stored correctly
- [ ] isInterState flag correct

---

## 🚨 Error Testing

### **Test 15: Handle Errors**
```
Test A: No GSTIN for B2B
1. Select B2B
2. Don't enter GSTIN
3. ✅ Should show error or default to B2C

Test B: Invalid GSTIN
1. Select B2B
2. Enter: "INVALID123"
3. ✅ Should reject with error message

Test C: GST Disabled
1. Disable GST: db.gstsettings.updateOne({}, {$set: {enableGST: false}})
2. Create sale
3. ✅ Should work without GST

Test D: Missing Settings
1. Delete GST settings
2. Create sale
3. ✅ Should handle gracefully
```

---

## 📋 Final Checklist

### **Before Going Live**:
- [ ] GST Settings configured with real GSTIN
- [ ] Business address updated
- [ ] State code correct
- [ ] Tax rates verified (2.5% + 2.5% or 5%)
- [ ] HSN code correct for products
- [ ] Tested with actual customers
- [ ] Bill format approved
- [ ] Printer working with GST bills
- [ ] CSV export tested
- [ ] Staff trained on B2B vs B2C

### **Compliance Check**:
- [ ] GSTIN format valid
- [ ] Tax invoice requirements met
- [ ] HSN codes displayed
- [ ] CGST/SGST/IGST properly segregated
- [ ] Customer GSTIN captured for B2B
- [ ] Place of supply recorded
- [ ] Reports match GSTR-1 format

---

## 🎉 Success Criteria

**System is ready when**:
✅ All 15 tests pass  
✅ Bills print correctly  
✅ Reports show accurate data  
✅ CSV exports successfully  
✅ No errors in console  
✅ Database records correct  
✅ GSTIN validation works  
✅ State detection accurate  

---

## 🆘 Need Help?

### **Common Issues**:

**Issue**: GST not calculating  
**Fix**: Check `enableGST: true` in settings

**Issue**: Wrong tax type  
**Fix**: Verify state codes match/mismatch

**Issue**: Bill not showing GST  
**Fix**: Ensure sale has `totalGST > 0`

**Issue**: Reports page error  
**Fix**: ✅ Already fixed - refresh browser

**Issue**: CSV not downloading  
**Fix**: Check browser download settings

---

## 📞 Support Files

- `GST_IMPLEMENTATION.md` - Full documentation
- `GST_FIX_SUMMARY.md` - Recent fixes
- `TEST_GST_QUERIES.js` - MongoDB test queries
- `test-gst-sales.js` - Auto-generate test data
- `setup-gst-settings.js` - Initial setup

---

**Testing Completed**: ________ (Date)  
**Tested By**: ________  
**Status**: ✅ Pass / ❌ Fail  
**Notes**: ________________________

---

**Happy Testing! 🚀**
