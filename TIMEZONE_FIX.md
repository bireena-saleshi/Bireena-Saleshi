# Timezone Fix Documentation

## Problem
MongoDB Atlas stores all dates in **UTC** (Coordinated Universal Time), but our app displays times in **IST** (Indian Standard Time, UTC+5:30). This caused inconsistency between the printed bill time and the database time visible in MongoDB Atlas.

## Solution Overview
✅ **Store in UTC** (MongoDB does this automatically)  
✅ **Display in IST** (we convert when showing to users)

---

## What Changed

### 1. New Timezone Helper (`backend/utils/timezone.js`)
- `formatToIST(date, format)` - Converts UTC to IST with custom formatting
- `formatForBill(date)` - Special format for bills: "27/11/2025, 11:19:10 PM"
- `getDateTimeSeparate(date)` - Returns { date: "27/11/2025", time: "11:19:10 PM" }
- `getCurrentTime()` - Gets current time (stored as UTC internally)
- `addTimezoneToLocals` - Middleware to make helpers available in all EJS templates

### 2. Server Configuration (`server.js`)
Added timezone middleware **before** routes:
```javascript
const { addTimezoneToLocals } = require('./backend/utils/timezone');
app.use(addTimezoneToLocals);
```

Now all EJS templates have access to:
- `formatToIST(date)`
- `getDateTimeSeparate(date)`
- `formatForBill(date)`

### 3. Bill Routes (`backend/routes/bill.js`)
Updated both `/bill/:id` and `/bill/print/:id` routes to format dates:
```javascript
const displayDateTime = getDateTimeSeparate(sale.createdAt);
res.render('bill/print', { 
    sale,
    displayDate: displayDateTime.date,  // "27/11/2025"
    displayTime: displayDateTime.time,  // "11:19:10 PM"
    layout: false 
});
```

### 4. Bill Print Template (`frontend/views/bill/print.ejs`)
Changed from:
```html
<span><%= new Date(sale.createdAt).toLocaleString() %></span>
```

To:
```html
<div class="info-row">
    <strong>Date:</strong>
    <span><%= displayDate %></span>
</div>
<div class="info-row">
    <strong>Time:</strong>
    <span><%= displayTime %></span>
</div>
```

### 5. Sales Table Row (`frontend/views/sales/partials/sales-table-row.ejs`)
Changed from:
```html
<td><%= new Date(sale.createdAt).toLocaleDateString('en-IN') %></td>
<td><%= new Date(sale.createdAt).toLocaleTimeString('en-IN') %></td>
```

To:
```html
<td><%= getDateTimeSeparate(sale.createdAt).date %></td>
<td><%= getDateTimeSeparate(sale.createdAt).time %></td>
```

---

## How It Works

### Storage (Backend)
```javascript
// Mongoose automatically stores Date in UTC
const saleSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now  // Stores current time in UTC
    }
});
```

### Display (Frontend)
```javascript
// In routes
const displayDateTime = getDateTimeSeparate(sale.createdAt);
// Returns: { date: "27/11/2025", time: "11:19:10 PM" }

// In EJS templates (now available globally)
<%= formatToIST(sale.createdAt) %>
// Outputs: "27/11/2025, 11:19:10 PM"

<%= getDateTimeSeparate(sale.createdAt).date %>
// Outputs: "27/11/2025"

<%= getDateTimeSeparate(sale.createdAt).time %>
// Outputs: "11:19:10 PM"
```

---

## Testing Checklist

### ✅ Test 1: Create New Sale
1. Go to sales page and create a new sale
2. Note the time shown on the printed bill
3. Check MongoDB Atlas - `createdAt` should be 5:30 hours **earlier** (UTC)
4. Bill should show IST time (your local time)

### ✅ Test 2: View Bill
1. Open any existing bill: `/bill/{id}`
2. Date and time should show in IST format
3. Should match what you see on the printed version

### ✅ Test 3: Sales List
1. Go to sales history page
2. All dates and times should show in IST
3. Sort by date - should work correctly

### ✅ Test 4: Print Bill
1. Click print on any bill
2. Date should be in format: `27/11/2025`
3. Time should be in format: `11:19:10 PM`
4. Both should match the main bill view

### ✅ Test 5: MongoDB Atlas Verification
1. Open MongoDB Atlas cluster
2. Browse to `bireena_bakery.sales` collection
3. Look at `createdAt` field - it will show UTC time
4. Calculate: IST = UTC + 5:30 hours
5. Verify it matches your bill's displayed time

---

## Example Time Conversion

| Event | UTC (MongoDB) | IST (Displayed) | Difference |
|-------|---------------|-----------------|------------|
| Sale created | 2025-11-27T17:49:10.851Z | 27/11/2025, 11:19:10 PM | +5:30 |
| Next day sale | 2025-11-28T03:00:00.000Z | 28/11/2025, 08:30:00 AM | +5:30 |

---

## Dependencies

### Required
```json
{
  "luxon": "^3.4.0"
}
```

### Installation
```bash
npm install luxon
```

### Why Luxon?
- ✅ Modern, reliable timezone handling
- ✅ Better than `moment.js` (which is deprecated)
- ✅ Lightweight and well-maintained
- ✅ Great API for timezone conversions

### Fallback Option
If you can't use luxon, there's a fallback using `Intl.DateTimeFormat`:
```javascript
formatToISTFallback(date) {
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-IN', options).format(date);
}
```

---

## Best Practices Going Forward

### ✅ DO:
- Always use `getDateTimeSeparate()` or `formatToIST()` when displaying dates
- Store dates using `Date.now()` or `new Date()` (automatically UTC)
- Use the timezone helpers available in all EJS templates
- Test with MongoDB Atlas to verify UTC storage

### ❌ DON'T:
- Don't use `new Date().toLocaleString()` directly in templates
- Don't store timezone info in the database
- Don't manually add/subtract 5.5 hours
- Don't use deprecated libraries like moment.js

---

## File Changes Summary

### New Files
- ✅ `backend/utils/timezone.js` - Timezone conversion utilities
- ✅ `TIMEZONE_FIX.md` - This documentation

### Modified Files
- ✅ `server.js` - Added timezone middleware
- ✅ `backend/routes/bill.js` - Format dates before sending to views
- ✅ `frontend/views/bill/print.ejs` - Use formatted dates
- ✅ `frontend/views/sales/partials/sales-table-row.ejs` - Use formatted dates

### Models (No Changes Needed)
- ✅ `backend/models/Sale.js` - Already has `createdAt` with Date.now

---

## Need Help?

### Common Issues

**Q: MongoDB still shows different time**  
A: That's normal! MongoDB **always** stores in UTC. Your app converts to IST for display.

**Q: Bills show wrong time after deploying**  
A: Check server timezone. The luxon library handles this automatically using 'Asia/Kolkata'.

**Q: Time is off by 5 hours 30 minutes**  
A: That's the UTC-IST difference. Make sure you're using the timezone helpers.

**Q: Can I change the timezone?**  
A: Yes! Edit `TIMEZONE` constant in `backend/utils/timezone.js`:
```javascript
const TIMEZONE = 'America/New_York'; // Change as needed
```

---

## Quick Reference

### Using in EJS Templates
```html
<!-- Full date/time -->
<%= formatToIST(sale.createdAt) %>

<!-- Date only -->
<%= getDateTimeSeparate(sale.createdAt).date %>

<!-- Time only -->
<%= getDateTimeSeparate(sale.createdAt).time %>

<!-- Bill format -->
<%= formatForBill(sale.createdAt) %>
```

### Using in Routes
```javascript
const { formatToIST, getDateTimeSeparate } = require('../utils/timezone');

// In route handler
const displayDateTime = getDateTimeSeparate(sale.createdAt);
res.render('template', {
    displayDate: displayDateTime.date,
    displayTime: displayDateTime.time
});
```

---

## Verification Steps

After server restart:

1. ✅ Install luxon: `npm install luxon`
2. ✅ Restart server: `node server.js`
3. ✅ Create a new sale
4. ✅ Print the bill - note the time
5. ✅ Check MongoDB Atlas - should be 5:30 hours earlier
6. ✅ View bill in app - should match printed time
7. ✅ Check sales list - all times should be consistent

---

**✨ All times are now consistent between display and storage!**
