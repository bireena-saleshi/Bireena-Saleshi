# 🥐 Bireena Bakery Management System - Complete Guide

## ✅ Installation Complete!

Your bakery management system is fully set up with all the requested features.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Make sure MongoDB is installed and running
- If not installed, download from: https://www.mongodb.com/try/download/community
- MongoDB usually runs automatically as a Windows service

### Step 2: Start the application
Open PowerShell in this folder and run:
```powershell
npm start
```

Or use the quick start script:
```powershell
.\start.ps1
```

### Step 3: Open your browser
Navigate to: **http://localhost:3000**

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## 📋 All Implemented Features

### ✅ 1. Login System
- Secure authentication with password hashing
- Admin role management
- Session-based login

### ✅ 2. Stock Management (Inventory)
- Add/Edit/Delete products
- Track stock levels in real-time
- Multiple categories (Bread, Cake, Pastry, Cookie, Other)
- Multiple units (piece, kg, dozen, box)
- Low stock alerts with reorder levels
- Product descriptions

### ✅ 3. Sales System
- Interactive cart-based sales interface
- Real-time product search
- Quantity management
- Stock validation
- Multiple payment methods (Cash, Card, UPI, Online)
- Customer information capture

### ✅ 4. Special Discounts
- Percentage or fixed amount discounts
- Apply to: All products, Specific categories, or Individual products
- Date-range based validity
- Activate/Deactivate discounts
- Admin-only access

### ✅ 5. SMS Bill Sending
- Automatic SMS on sale completion
- Send bill details to customer phone
- Resend SMS option
- Twilio integration
- SMS delivery status tracking

### ✅ 6. Bill Section
- Auto-generated bill numbers (BILL-0001, BILL-0002, etc.)
- Detailed bill view
- Print-friendly bill format
- Bill history with search
- Customer details on bills
- Payment method tracking

### ✅ 7. Online Mobile Reposing (Bill Management)
- View all sales/bills
- Search and filter bills
- Resend SMS to customers
- Print bills anytime
- Mobile-responsive design

### ✅ 8. Inventory Management
- Complete stock tracking
- Product categories
- Price management
- Stock updates on sales
- Low stock warnings
- Stock reports

### ✅ 9. Admin Authentication
- Role-based access control
- Admin vs Staff permissions
- Secure password storage
- Session management
- Logout functionality

### ✅ 10. Dashboard
- Real-time statistics
- Today's sales and revenue
- Total revenue tracking
- Product count
- Low stock alerts
- Recent sales overview

---

## 📁 Project Structure

```
Bireena Bakery/
├── 📄 server.js              # Main application server
├── 📄 package.json           # Dependencies and scripts
├── 📄 .env                   # Configuration (credentials)
├── 📄 start.ps1              # Quick start script
├── 📄 README.md              # Project overview
├── 📄 INSTALLATION.md        # Detailed setup guide
├── 📄 GETTING_STARTED.md     # This guide
│
├── 📁 models/                # Database schemas
│   ├── User.js              # User authentication
│   ├── Product.js           # Products/inventory
│   ├── Sale.js              # Sales transactions
│   └── Discount.js          # Discount rules
│
├── 📁 routes/                # Application routes
│   ├── auth.js              # Login/logout
│   ├── dashboard.js         # Dashboard stats
│   ├── inventory.js         # Product management
│   ├── sales.js             # Sales processing
│   ├── discount.js          # Discount management
│   └── bill.js              # Bill viewing/SMS
│
├── 📁 views/                 # Frontend templates
│   ├── login.ejs            # Login page
│   ├── dashboard.ejs        # Dashboard
│   ├── partials/            # Reusable components
│   ├── inventory/           # Inventory pages
│   ├── sales/               # Sales pages
│   ├── bill/                # Bill pages
│   └── discount/            # Discount pages
│
├── 📁 public/                # Static assets
│   ├── css/style.css        # Custom styles
│   ├── js/main.js           # General JavaScript
│   └── js/sales.js          # Sales page logic
│
├── 📁 middleware/            # Express middleware
│   └── auth.js              # Authentication checks
│
└── 📁 utils/                 # Utility functions
    └── sms.js               # SMS/Twilio integration
```

---

## 🎯 How to Use Each Feature

### 1️⃣ Login
1. Open http://localhost:3000
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click Login

### 2️⃣ Add Products to Inventory
1. Click **Inventory** → **Add Product**
2. Enter product details:
   - Name (e.g., "Chocolate Cake")
   - Category (Bread/Cake/Pastry/Cookie/Other)
   - Price (e.g., 250)
   - Stock (e.g., 10)
   - Unit (piece/kg/dozen/box)
   - Reorder Level (e.g., 5)
3. Click **Add Product**

### 3️⃣ Create a Sale
1. Click **New Sale** in navigation
2. Search for products
3. Click **Add** to add to cart
4. Adjust quantities with +/- buttons
5. Apply discount if needed:
   - Enter discount value
   - Choose percentage (%) or fixed (₹)
6. Enter customer details:
   - Name (optional)
   - Phone number (for SMS)
   - Payment method
7. Click **Complete Sale**

### 4️⃣ View Bills
1. After sale, bill opens automatically
2. Or go to **Sales** to see all bills
3. Click eye icon to view details
4. Click printer icon to print

### 5️⃣ Send SMS Bill
- SMS sent automatically if phone number provided
- Or click **Send SMS** button on bill page
- Requires Twilio configuration

### 6️⃣ Manage Discounts (Admin Only)
1. Click **Discounts** in navigation
2. Click **Add Discount**
3. Enter discount details:
   - Name (e.g., "Weekend Sale")
   - Type (Percentage or Fixed)
   - Value (e.g., 10% or ₹50)
   - Applicable on (All/Category/Product)
   - Start and End dates
4. Click **Add Discount**
5. Toggle active/inactive as needed

### 7️⃣ Check Low Stock
1. Dashboard shows low stock count
2. Click **Low Stock** button
3. View products below reorder level
4. Click **Update Stock** to edit

### 8️⃣ View Reports
- **Dashboard**: Overall statistics
- **Sales**: Complete sales history
- **Inventory**: All products and stock levels

---

## ⚙️ Configuration

### SMS Setup (Twilio)
To enable SMS functionality:

1. Create account at: https://www.twilio.com/try-twilio
2. Get your credentials from Twilio Console:
   - Account SID
   - Auth Token
   - Twilio Phone Number
3. Edit `.env` file and update:
```
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```
4. Restart the server

**Note:** Without Twilio, all features work except SMS sending.

### Change Admin Password
1. Edit `.env` file
2. Change these lines:
```
ADMIN_USERNAME=your_new_username
ADMIN_PASSWORD=your_new_password
```
3. Delete the old admin from database or restart fresh

---

## 🎨 Features Breakdown

### Dashboard Statistics
- **Total Products**: Count of all inventory items
- **Low Stock**: Products at/below reorder level
- **Today's Sales**: Number of sales today
- **Today's Revenue**: Total money earned today
- **Total Revenue**: All-time earnings
- **Recent Sales**: Last 5 transactions

### Inventory Features
- Add unlimited products
- Edit product details anytime
- Delete products (with confirmation)
- Category-wise organization
- Stock level tracking
- Automatic stock reduction on sales
- Low stock alerts
- Reorder level customization

### Sales Features
- Real-time product search
- Shopping cart interface
- Quantity adjustment
- Stock validation (prevents overselling)
- Discount application
- Multiple payment methods
- Customer information capture
- Auto bill generation

### Bill Features
- Sequential bill numbering
- Detailed itemized bills
- Customer information
- Payment method tracking
- Print-friendly format
- SMS delivery status
- Resend SMS option
- Bill history

### Discount Features
- Flexible discount types
- Percentage or fixed amount
- Apply globally or selectively
- Date-range validity
- Quick activate/deactivate
- Admin-only management

---

## 📱 Mobile Responsive
The entire system is mobile-responsive and works on:
- Desktop computers
- Laptops
- Tablets
- Mobile phones

---

## 🔒 Security Features
- Password hashing with bcrypt
- Session-based authentication
- JWT tokens
- Role-based access control
- XSS protection
- CSRF protection (via sessions)
- Secure environment variables

---

## 🛠️ Troubleshooting

### Can't connect to database
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```powershell
net start MongoDB
```

### Port 3000 already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in `.env` to 3001 or kill the process

### SMS not sending
- Check Twilio credentials in `.env`
- Verify phone number includes country code (e.g., +91 for India)
- Check Twilio account has credits
- View error message in console

### Can't login
- Check MongoDB is running
- Use default: admin / admin123
- Check console for errors

---

## 💾 Database Backup

### Backup Database
```powershell
mongodump --db bireena_bakery --out "C:\Backup"
```

### Restore Database
```powershell
mongorestore --db bireena_bakery "C:\Backup\bireena_bakery"
```

---

## 📊 Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Frontend** | EJS Templates + Bootstrap 5 |
| **Authentication** | bcryptjs + JWT + express-session |
| **SMS** | Twilio API |
| **Icons** | Bootstrap Icons |
| **Styling** | Custom CSS + Bootstrap |

---

## 🎓 Learning Resources

- **Node.js**: https://nodejs.org/docs
- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Bootstrap**: https://getbootstrap.com/docs
- **Twilio**: https://www.twilio.com/docs

---

## 📞 Support

### Common Issues
1. **MongoDB not starting**: Install MongoDB Community Server
2. **Dependencies error**: Run `npm install` again
3. **Port conflict**: Change PORT in `.env`
4. **SMS not working**: Verify Twilio credentials

### Getting Help
1. Check INSTALLATION.md for detailed setup
2. Review error messages in console
3. Check MongoDB connection
4. Verify all files are present

---

## 🎉 Congratulations!

Your complete bakery management system is ready with:
- ✅ Login authentication
- ✅ Stock/inventory management
- ✅ Sales processing
- ✅ Special discounts
- ✅ SMS bill sending
- ✅ Bill management
- ✅ Mobile responsive design
- ✅ Admin authentication
- ✅ Complete dashboard

**Start the server with:** `npm start`

**Access at:** http://localhost:3000

**Login:** admin / admin123

---

**Happy Baking! 🥐🍰🍪**
