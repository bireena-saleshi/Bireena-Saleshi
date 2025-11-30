# GST Implementation Guide for Bakery Management System

## Overview
Complete GST (Goods and Services Tax) implementation for B2B and B2C sales with automatic tax calculation, GSTIN validation, and GSTR-1 format reporting.

---

## Features Implemented

### 1. **GST Data Models**
- **Sale Model Updates**: Added GST fields to track customer type, GSTIN, tax amounts
- **GSTSettings Model**: Centralized GST configuration storage
- **Fields Added**:
  - Customer Type (B2B/B2C)
  - Customer GSTIN
  - Place of Supply
  - HSN Codes
  - CGST/SGST/IGST rates and amounts
  - Inter-state transaction flag

### 2. **GST Calculations**
- Automatic CGST + SGST calculation for intra-state transactions
- Automatic IGST calculation for inter-state transactions
- Per-item tax calculation with HSN code tracking
- Total tax aggregation

### 3. **Bill Integration**
- GST details shown on bill print (thermal printer compatible)
- GST breakdown on bill view page
- Customer GSTIN displayed for B2B transactions
- HSN codes listed for each item

### 4. **GST Reports**
- GSTR-1 format report with B2B and B2C segregation
- Date range filtering
- Customer type filtering
- CSV export functionality
- Summary cards showing:
  - Total sales
  - B2B vs B2C breakdown
  - Total GST collected
  - CGST/SGST/IGST breakdown

---

## Setup Instructions

### Step 1: Initialize GST Settings

Run the setup script to create default GST settings:

```bash
node setup-gst-settings.js
```

This will create default settings with:
- Default HSN Code: 19059020 (bakery products)
- Default CGST Rate: 2.5%
- Default SGST Rate: 2.5%
- Default IGST Rate: 5%

### Step 2: Update Your Business Details

Update the GST settings in MongoDB with your actual business information:

```javascript
// Connect to MongoDB and update:
db.gstsettings.updateOne(
  {},
  {
    $set: {
      businessName: "Your Bakery Name",
      gstin: "27XXXXX0000X1Z5", // Your actual GSTIN
      stateCode: "27", // Your state code
      stateName: "Maharashtra", // Your state
      address: "Your full business address",
      pincode: "400001" // Your pincode
    }
  }
)
```

**Important**: Also update admin User model with `shopGST` field:
```javascript
db.users.updateOne(
  { role: "admin" },
  { $set: { shopGST: "27XXXXX0000X1Z5" } }
)
```

---

## GSTIN Format

Valid GSTIN format: `99AAAAA9999A9Z9`
- First 2 digits: State code
- Next 10 characters: PAN
- 13th character: Entity number
- 14th character: Z (default)
- 15th character: Checksum

Example: `27AABCT1234C1Z5`

---

## State Codes Reference

| State | Code | State | Code |
|-------|------|-------|------|
| Jammu and Kashmir | 01 | Maharashtra | 27 |
| Himachal Pradesh | 02 | Karnataka | 29 |
| Punjab | 03 | Goa | 30 |
| Chandigarh | 04 | Tamil Nadu | 33 |
| Uttarakhand | 05 | Puducherry | 34 |
| Haryana | 06 | Andaman and Nicobar | 35 |
| Delhi | 07 | Telangana | 36 |
| Rajasthan | 08 | Andhra Pradesh | 37 |
| Uttar Pradesh | 09 | West Bengal | 19 |
| Bihar | 10 | Kerala | 32 |
| Sikkim | 11 | Gujarat | 24 |
| Arunachal Pradesh | 12 | Rajasthan | 08 |

---

## HSN Codes for Bakery Products

| Product | HSN Code |
|---------|----------|
| Bread | 19051000 |
| Cakes & Pastries | 19059020 |
| Biscuits | 19059010 |
| Wafers | 19059030 |
| Rusks | 19054000 |

**Default Used**: `19059020` (Cakes, Pastries, Buns)

---

## Usage Guide

### For B2C Sales (Retail Customers)
1. Create sale as usual
2. Customer Type defaults to "B2C"
3. No GSTIN required
4. GST calculated and included in total
5. Bill shows standard format

### For B2B Sales (Business Customers)
1. Create sale normally
2. **Backend automatically detects B2B if**:
   - `customerType` is set to "B2B"
   - `customerGSTIN` is provided
3. System validates GSTIN format
4. Extracts state code from GSTIN
5. Compares with seller state code
6. Calculates:
   - **Same State**: CGST + SGST
   - **Different State**: IGST
7. Bill displays:
   - Customer GSTIN
   - HSN codes
   - Individual item taxes
   - Total tax breakdown

---

## API Endpoints

### GST Reports
- **GET** `/gst-reports` - View GST report with filters
- **GET** `/gst-reports/export` - Export CSV

### Query Parameters:
- `startDate`: YYYY-MM-DD format
- `endDate`: YYYY-MM-DD format
- `customerType`: all | B2B | B2C

---

## Database Schema Changes

### Sale Model (backend/models/Sale.js)
```javascript
customerType: 'B2C' | 'B2B'
customerGSTIN: String (15 chars)
placeOfSupply: String
isInterState: Boolean
totalTaxableAmount: Number
totalCGST: Number
totalSGST: Number
totalIGST: Number
totalGST: Number
```

### Sale Item Schema
```javascript
hsnCode: String
taxableAmount: Number
cgstRate: Number
cgstAmount: Number
sgstRate: Number
sgstAmount: Number
igstRate: Number
igstAmount: Number
```

---

## UI Changes (Non-Breaking)

### Bill Print (`/bill/print/:id`)
- Shows customer GSTIN for B2B
- Displays HSN codes in table
- Shows CGST/SGST/IGST breakdown
- Tax rows highlighted in blue

### Bill View (`/bill/:id`)
- B2B badge shown for business customers
- Customer GSTIN displayed
- HSN codes in table
- Tax breakdown before total

### Reports Page (`/reports`)
- New "GST Reports" button added
- Links to `/gst-reports`

---

## Testing Checklist

### B2C Sale Test
1. Create sale without GSTIN
2. Verify `customerType = 'B2C'`
3. Check bill shows GST in total
4. No GSTIN or HSN displayed

### B2B Same State Test
1. Create sale with customer GSTIN (same state)
2. Verify CGST + SGST calculated
3. Check `isInterState = false`
4. Bill shows CGST and SGST rows

### B2B Inter-State Test
1. Create sale with customer GSTIN (different state)
2. Verify IGST calculated
3. Check `isInterState = true`
4. Bill shows only IGST row

### GST Report Test
1. Navigate to `/gst-reports`
2. Apply date filters
3. Verify B2B/B2C segregation
4. Export CSV and verify data

---

## Tax Calculation Logic

### Intra-State (Same State Code)
```
Taxable Amount = Item Subtotal (after discount)
CGST = Taxable Amount × 2.5%
SGST = Taxable Amount × 2.5%
Total Tax = CGST + SGST
Final Amount = Taxable Amount + Total Tax
```

### Inter-State (Different State Codes)
```
Taxable Amount = Item Subtotal (after discount)
IGST = Taxable Amount × 5%
Total Tax = IGST
Final Amount = Taxable Amount + Total Tax
```

---

## Compliance Notes

### GSTR-1 Filing
- Use `/gst-reports/export` to get CSV
- Contains all required fields:
  - Invoice number
  - Date
  - Customer details
  - GSTIN
  - Taxable value
  - Tax amounts
  - Total invoice value

### Invoice Requirements (B2B)
✅ Tax Invoice (not Bill of Supply)
✅ HSN/SAC Code
✅ GSTIN of supplier
✅ GSTIN of recipient
✅ Place of supply
✅ Tax breakdown (CGST/SGST or IGST)

---

## Troubleshooting

### GST Not Calculating
- Check if `enableGST` is true in GSTSettings
- Verify GSTIN format is valid
- Ensure state codes are set correctly

### Wrong Tax Applied
- Verify seller GSTIN state code
- Check customer GSTIN state code
- Confirm `isInterState` flag

### Bill Not Showing GST
- Ensure sale has `totalGST > 0`
- Check `customerType` field exists
- Verify EJS template updates applied

---

## Files Modified/Created

### New Files
1. `backend/models/GSTSettings.js` - GST configuration model
2. `backend/utils/gst-calculator.js` - Tax calculation utilities
3. `backend/routes/gst-reports.js` - GST report routes
4. `frontend/views/reports/gst-report.ejs` - GST report page
5. `setup-gst-settings.js` - Setup script

### Modified Files
1. `backend/models/Sale.js` - Added GST fields
2. `backend/routes/sales.js` - Integrated GST calculation
3. `frontend/views/bill/print.ejs` - Added GST display
4. `frontend/views/bill/view.ejs` - Added GST display
5. `frontend/views/reports/index.ejs` - Added GST Reports button
6. `server.js` - Registered GST routes

---

## Support & Maintenance

### To Change Tax Rates
Update in MongoDB:
```javascript
db.gstsettings.updateOne({}, {
  $set: {
    defaultCGSTRate: 2.5,  // Change as needed
    defaultSGSTRate: 2.5,
    defaultIGSTRate: 5
  }
})
```

### To Disable GST
```javascript
db.gstsettings.updateOne({}, {
  $set: { enableGST: false }
})
```

### To Change HSN Code
```javascript
db.gstsettings.updateOne({}, {
  $set: { defaultHSNCode: "19051000" } // For bread
})
```

---

## Future Enhancements

- [ ] Product-wise HSN code assignment
- [ ] Product-wise GST rate configuration
- [ ] E-invoice generation (IRN)
- [ ] E-way bill integration
- [ ] GSTR-2 reconciliation
- [ ] TDS/TCS handling
- [ ] Reverse charge mechanism

---

## Contact

For issues or questions regarding GST implementation, refer to:
- [GST Portal](https://www.gst.gov.in/)
- [GSTN Developer Portal](https://developer.gstsystem.in/)

---

**Last Updated**: November 30, 2025
**Version**: 1.0
**Status**: Production Ready ✅
