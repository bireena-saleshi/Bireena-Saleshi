# Bireena Bakery - Installation & Setup Guide

## Complete Installation Steps

### 1. Install Prerequisites

#### Install Node.js
1. Download Node.js from: https://nodejs.org/
2. Install the LTS version (v18 or higher recommended)
3. Verify installation:
```powershell
node --version
npm --version
```

#### Install MongoDB
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically
4. Verify installation:
```powershell
mongod --version
```

### 2. Install Project Dependencies

Open PowerShell in the project directory and run:

```powershell
cd "c:\Users\hp\OneDrive\Desktop\Bireena Bakery"
npm install
```

### 3. Configure Environment Variables

The `.env` file is already created. Update these values:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bireena_bakery
JWT_SECRET=your_secret_key_change_this_in_production
SESSION_SECRET=your_session_secret_change_this_in_production

# For SMS functionality (Optional - Get from Twilio.com)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Default Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Setup Twilio for SMS (Optional but Recommended)

1. Create a free account at: https://www.twilio.com/try-twilio
2. Get your Account SID and Auth Token from the Twilio Dashboard
3. Get a Twilio phone number
4. Update the `.env` file with your Twilio credentials

**Note:** Without Twilio setup, all features will work except SMS sending.

### 5. Start MongoDB

MongoDB should already be running as a Windows service. If not:

```powershell
# Start MongoDB service
net start MongoDB
```

### 6. Run the Application

```powershell
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 8. Login

Use the default credentials:
- **Username:** admin
- **Password:** admin123

**IMPORTANT:** Change these credentials after first login!

## Features Overview

### ✅ Implemented Features

1. **Authentication System**
   - Secure login with bcrypt password hashing
   - Session management
   - Role-based access (Admin/Staff)

2. **Inventory Management**
   - Add, edit, delete products
   - Track stock levels
   - Low stock alerts
   - Multiple units (piece, kg, dozen, box)
   - Category management

3. **Sales Management**
   - Create new sales with cart system
   - Real-time stock validation
   - Multiple payment methods (Cash, Card, UPI, Online)
   - Customer information capture

4. **Billing System**
   - Auto-generated bill numbers
   - Print-friendly bill format
   - Detailed bill view
   - Bill history

5. **Discount Management** (Admin Only)
   - Percentage or fixed amount discounts
   - Apply to all products, categories, or specific items
   - Date-range based discounts
   - Activate/deactivate discounts

6. **SMS Integration**
   - Send bills via SMS to customers
   - Twilio integration
   - Resend SMS option

7. **Dashboard**
   - Real-time statistics
   - Today's sales and revenue
   - Total revenue tracking
   - Low stock alerts
   - Recent sales overview

## Project Structure

```
Bireena Bakery/
├── models/              # Database models
│   ├── User.js         # User authentication
│   ├── Product.js      # Product/inventory
│   ├── Sale.js         # Sales transactions
│   └── Discount.js     # Discount management
├── routes/              # Express routes
│   ├── auth.js         # Login/logout
│   ├── dashboard.js    # Dashboard
│   ├── inventory.js    # Inventory management
│   ├── sales.js        # Sales processing
│   ├── discount.js     # Discount management
│   └── bill.js         # Bill viewing/printing
├── views/               # EJS templates
│   ├── partials/       # Reusable components
│   ├── inventory/      # Inventory views
│   ├── sales/          # Sales views
│   ├── bill/           # Bill views
│   └── discount/       # Discount views
├── public/              # Static files
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript files
├── middleware/          # Express middleware
│   └── auth.js         # Authentication middleware
├── utils/               # Utility functions
│   └── sms.js          # SMS functionality
├── server.js            # Main application file
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Usage Guide

### Adding Products
1. Navigate to **Inventory** → **Add Product**
2. Fill in product details (name, category, price, stock)
3. Set reorder level for low stock alerts
4. Click "Add Product"

### Creating a Sale
1. Click **New Sale** in the navigation
2. Search and add products to cart
3. Adjust quantities as needed
4. Apply discount if applicable
5. Enter customer details (optional)
6. Select payment method
7. Click "Complete Sale"

### Managing Discounts (Admin Only)
1. Navigate to **Discounts**
2. Click **Add Discount**
3. Set discount type (percentage/fixed)
4. Choose applicability (all/category/product)
5. Set date range
6. Activate/deactivate as needed

### Viewing Reports
- Dashboard shows real-time statistics
- Sales history available in **Sales** section
- Inventory status in **Inventory** section
- Low stock items in **Low Stock** page

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```powershell
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in `.env` file or kill the process using port 3000

### SMS Not Sending
- Verify Twilio credentials in `.env`
- Check phone number format (should include country code)
- Ensure Twilio account has credits

### Application Not Loading
1. Check if MongoDB is running
2. Verify all dependencies are installed (`npm install`)
3. Check console for error messages
4. Ensure `.env` file exists with correct values

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Credentials:** Immediately change admin username and password
2. **Secure Environment Variables:** Never commit `.env` file to version control
3. **Use Strong Secrets:** Generate strong random strings for JWT_SECRET and SESSION_SECRET
4. **HTTPS in Production:** Use HTTPS in production environments
5. **Database Security:** Set up MongoDB authentication in production

## Development vs Production

### Development Mode
```powershell
npm run dev
```
- Auto-restart on file changes (using nodemon)
- Detailed error messages
- No performance optimizations

### Production Mode
```powershell
npm start
```
- Manual restart required
- Production-ready error handling
- Optimized for performance

## Adding New Users

Currently, only admin can be created automatically. To add more users:

1. Use MongoDB Compass or mongo shell
2. Connect to database: `bireena_bakery`
3. Insert new user in `users` collection
4. Password will be hashed automatically on first login

**OR** Extend the application to add user management page (future enhancement).

## Support & Maintenance

### Database Backup
```powershell
# Backup MongoDB database
mongodump --db bireena_bakery --out "path/to/backup"

# Restore database
mongorestore --db bireena_bakery "path/to/backup/bireena_bakery"
```

### Clear All Data (Reset)
```javascript
// In MongoDB shell
use bireena_bakery
db.dropDatabase()
```

## Future Enhancements (Suggestions)

- [ ] User management interface
- [ ] Advanced reporting and analytics
- [ ] Export sales data to Excel/PDF
- [ ] Barcode scanning support
- [ ] Customer loyalty program
- [ ] Email notifications
- [ ] Multi-location support
- [ ] Staff performance tracking

## Technical Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** bcryptjs, express-session, JWT
- **Template Engine:** EJS
- **Frontend:** Bootstrap 5, JavaScript
- **SMS:** Twilio API
- **Icons:** Bootstrap Icons

## License

ISC License - Free to use and modify

## Contact & Support

For issues or questions:
1. Check the troubleshooting section
2. Review MongoDB and Node.js documentation
3. Check Twilio documentation for SMS issues

---

**Congratulations! Your Bireena Bakery Management System is ready to use! 🎉🥐**
