# 🏗️ Bakery Management System - MVC Structure & Routes

## 📁 Project Structure Overview

```
Bakery-Management/
│
├── 🎯 server.js                    # Main entry point
├── 📦 package.json                 # Dependencies & scripts
├── 🔐 .env                         # Environment variables
├── ⚙️ vercel.json                  # Deployment config
│
├── 📂 backend/                     # Backend (MVC - Model, Controller)
│   ├── 📂 config/                  # Configuration files
│   │   └── database.js             # MongoDB connection
│   │
│   ├── 📂 models/                  # 🗄️ Models (M in MVC)
│   │   ├── User.js                 # User schema (admin/staff)
│   │   ├── Product.js              # Product/inventory schema
│   │   ├── Sale.js                 # Sales transaction schema
│   │   ├── Discount.js             # Discount schema
│   │   └── Expense.js              # Expense tracking schema
│   │
│   ├── 📂 routes/                  # 🎮 Controllers (C in MVC)
│   │   ├── auth.js                 # Authentication routes
│   │   ├── dashboard.js            # Dashboard routes
│   │   ├── inventory.js            # Product management routes
│   │   ├── sales.js                # Sales/billing routes
│   │   ├── bill.js                 # Bill view/print routes
│   │   ├── discount.js             # Discount management routes
│   │   ├── reports.js              # Reports & analytics routes
│   │   ├── employees.js            # Employee management routes
│   │   ├── employee-activity.js    # Activity tracking routes
│   │   ├── profile.js              # User profile routes
│   │   └── contact.js              # Contact form routes
│   │
│   ├── 📂 middleware/              # 🛡️ Middleware functions
│   │   ├── auth.js                 # Authentication middleware
│   │   └── database.js             # Database middleware
│   │
│   └── 📂 utils/                   # 🔧 Utility functions
│       ├── sms.js                  # SMS service (Twilio)
│       └── timezone.js             # Timezone conversion (UTC ↔ IST)
│
└── 📂 frontend/                    # Frontend (V in MVC)
    ├── 📂 views/                   # 👁️ Views (V in MVC)
    │   ├── 📂 partials/            # Reusable components
    │   │   └── navbar.ejs          # Navigation bar
    │   │
    │   ├── 📂 sales/               # Sales views
    │   │   ├── list.ejs            # Sales history
    │   │   ├── new.ejs             # New sale form
    │   │   ├── cancel.ejs          # Cancel sale form
    │   │   └── 📂 partials/
    │   │       ├── sales-table-header.ejs
    │   │       └── sales-table-row.ejs
    │   │
    │   ├── 📂 bill/                # Bill views
    │   │   ├── view.ejs            # View bill
    │   │   └── print.ejs           # Print bill
    │   │
    │   ├── 📂 inventory/           # Inventory views
    │   │   ├── list.ejs            # Product list
    │   │   ├── add.ejs             # Add product
    │   │   └── edit.ejs            # Edit product
    │   │
    │   ├── 📂 discount/            # Discount views
    │   │   ├── list.ejs            # Discount list
    │   │   └── add.ejs             # Add discount
    │   │
    │   ├── 📂 reports/             # Reports views
    │   │   ├── index.ejs           # Main reports dashboard
    │   │   └── add-expense.ejs     # Add expense form
    │   │
    │   ├── 📂 employees/           # Employee views
    │   │   ├── list.ejs            # Employee list
    │   │   ├── add.ejs             # Add employee
    │   │   └── edit.ejs            # Edit employee
    │   │
    │   ├── 📂 profile/             # Profile views
    │   │   ├── view.ejs            # View profile
    │   │   ├── edit.ejs            # Edit profile
    │   │   └── change-password.ejs # Change password
    │   │
    │   ├── dashboard.ejs           # Main dashboard
    │   ├── home.ejs                # Landing page
    │   ├── login.ejs               # Login page
    │   ├── register.ejs            # Registration page
    │   ├── about.ejs               # About page
    │   ├── features.ejs            # Features page
    │   ├── pricing.ejs             # Pricing page
    │   ├── contact.ejs             # Contact page
    │   └── reset-password.ejs      # Password reset
    │
    ├── 📂 public/                  # Static assets
    │   ├── 📂 css/                 # Stylesheets
    │   │   └── style.css
    │   ├── 📂 js/                  # JavaScript files
    │   │   └── auth-protection.js  # Client-side auth
    │   └── 📂 images/              # Images
    │
    └── 📂 components/              # Reusable components

```

---

## 🛣️ Routes Structure

### 🔐 Authentication Routes (`/backend/routes/auth.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/` | Home page | ❌ |
| GET | `/features` | Features page | ❌ |
| GET | `/about` | About page | ❌ |
| GET | `/contact` | Contact page | ❌ |
| GET | `/pricing` | Pricing page | ❌ |
| POST | `/api/contact` | Submit contact form | ❌ |
| GET | `/login` | Login page | ❌ |
| POST | `/login` | Process login | ❌ |
| GET | `/register` | Register page | ❌ |
| POST | `/register` | Process registration | ❌ |
| GET | `/logout` | Logout (GET) | ✅ |
| POST | `/logout` | Logout (POST) | ✅ |
| GET | `/reset-password` | Reset password page | ❌ |
| POST | `/reset-password` | Send reset email | ❌ |
| GET | `/reset-password/:token` | Reset password form | ❌ |
| POST | `/reset-password/:token` | Process password reset | ❌ |
| GET | `/api/check-auth` | Check session validity | ✅ |
| GET | `/test-timezone` | Test timezone conversion | ❌ |

---

### 📊 Dashboard Routes (`/backend/routes/dashboard.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/dashboard` | Main dashboard | ✅ Admin/Staff |

---

### 📦 Inventory Routes (`/backend/routes/inventory.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/inventory` | Product list | ✅ Admin/Staff |
| GET | `/inventory/add` | Add product page | ✅ Admin/Staff |
| POST | `/inventory/add` | Create product | ✅ Admin/Staff |
| GET | `/inventory/edit/:id` | Edit product page | ✅ Admin/Staff |
| POST | `/inventory/edit/:id` | Update product | ✅ Admin/Staff |
| DELETE | `/inventory/delete/:id` | Delete product | ✅ Admin/Staff |
| POST | `/inventory/update-stock/:id` | Update stock | ✅ Admin/Staff |

---

### 💰 Sales Routes (`/backend/routes/sales.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/sales` | Sales history | ✅ Admin/Staff |
| GET | `/sales/new` | New sale form | ✅ Admin/Staff |
| POST | `/sales/create` | Create sale | ✅ Admin/Staff |
| GET | `/sales/:id` | View sale details | ✅ Admin/Staff |
| POST | `/sales/clear-due/:id` | Clear due payment | ✅ Admin/Staff |
| GET | `/sales/cancel/:id` | Cancel sale page | ✅ Admin/Staff |
| POST | `/sales/cancel/:id` | Process cancellation | ✅ Admin/Staff |
| POST | `/sales/api/validate-cart` | Validate cart (API) | ✅ Admin/Staff |
| POST | `/sales/api/calculate-total` | Calculate total (API) | ✅ Admin/Staff |

---

### 🧾 Bill Routes (`/backend/routes/bill.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/bill/:id` | View bill | ✅ Admin/Staff |
| GET | `/bill/print/:id` | Print bill | ✅ Admin/Staff |
| POST | `/bill/resend-sms/:id` | Resend SMS | ✅ Admin/Staff |

---

### 🏷️ Discount Routes (`/backend/routes/discount.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/discount` | Discount list | ✅ Admin |
| GET | `/discount/add` | Add discount page | ✅ Admin |
| POST | `/discount/add` | Create discount | ✅ Admin |
| POST | `/discount/toggle/:id` | Toggle discount status | ✅ Admin |
| DELETE | `/discount/delete/:id` | Delete discount | ✅ Admin |

---

### 📈 Reports Routes (`/backend/routes/reports.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/reports` | Reports dashboard | ✅ Admin/Staff |
| GET | `/reports/add-expense` | Add expense page | ✅ Admin |
| POST | `/reports/add-expense` | Create expense | ✅ Admin |
| DELETE | `/reports/delete-expense/:id` | Delete expense | ✅ Admin |
| GET | `/reports/api/sales-data` | Sales data API | ✅ Admin/Staff |

---

### 👥 Employee Routes (`/backend/routes/employees.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/employees` | Employee list | ✅ Admin |
| GET | `/employees/add` | Add employee page | ✅ Admin |
| POST | `/employees/add` | Create employee | ✅ Admin |
| GET | `/employees/edit/:id` | Edit employee page | ✅ Admin |
| POST | `/employees/edit/:id` | Update employee | ✅ Admin |
| POST | `/employees/toggle/:id` | Toggle active status | ✅ Admin |
| DELETE | `/employees/delete/:id` | Delete employee | ✅ Admin |

---

### 📋 Employee Activity Routes (`/backend/routes/employee-activity.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/employee-activity` | Activity dashboard | ✅ Admin |
| GET | `/employee-activity/details/:id` | Employee details | ✅ Admin |

---

### 👤 Profile Routes (`/backend/routes/profile.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/profile` | View profile | ✅ Admin/Staff |
| GET | `/profile/edit` | Edit profile page | ✅ Admin/Staff |
| POST | `/profile/edit` | Update profile | ✅ Admin/Staff |
| GET | `/profile/change-password` | Change password page | ✅ Admin only |
| POST | `/profile/change-password` | Update password | ✅ Admin only |

---

### 📧 Contact Routes (`/backend/routes/contact.js`)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/contact` | Submit contact form | ❌ |
| POST | `/api/contact` | Submit contact API | ❌ |

---

## 🗄️ Database Models (MongoDB)

### 👤 User Model (`backend/models/User.js`)
```javascript
{
  fullName: String,
  username: String (unique),
  email: String,
  phone: String,
  shopName: String,
  shopGST: String,
  shopAddress: String,
  branch: String,              // Employee branch
  password: String (hashed),
  role: String,                // 'admin' or 'staff'
  isActive: Boolean,
  createdBy: ObjectId,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 📦 Product Model (`backend/models/Product.js`)
```javascript
{
  name: String,
  category: String,            // Bread, Cake, Pastry, Cookie, Other
  price: Number,
  stock: Number,
  unit: String,
  description: String,
  addedBy: ObjectId,           // User reference
  createdAt: Date,
  updatedAt: Date
}
```

### 💰 Sale Model (`backend/models/Sale.js`)
```javascript
{
  billNumber: String (unique),
  items: [{
    product: ObjectId,
    productName: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  subtotal: Number,
  discount: Number,
  discountType: String,        // 'percentage' or 'fixed'
  total: Number,
  amountPaid: Number,
  dueAmount: Number,
  paymentStatus: String,       // 'paid', 'partial', 'due'
  customerName: String,
  customerPhone: String,
  paymentMethod: String,       // 'cash', 'card', 'upi', 'online'
  smsSent: Boolean,
  paymentHistory: [Object],
  isCancelled: Boolean,
  cancelledAt: Date,
  cancelledBy: ObjectId,
  cancellationReason: String,
  refundAmount: Number,
  refundMethod: String,
  refundProcessedBy: ObjectId,
  refundNotes: String,
  createdBy: ObjectId,         // User reference
  createdAt: Date (UTC)
}
```

### 🏷️ Discount Model (`backend/models/Discount.js`)
```javascript
{
  name: String,
  type: String,                // 'percentage' or 'fixed'
  value: Number,
  minPurchase: Number,
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 💸 Expense Model (`backend/models/Expense.js`)
```javascript
{
  category: String,
  amount: Number,
  description: String,
  date: Date,
  createdBy: ObjectId,
  createdAt: Date
}
```

---

## 🔐 Middleware

### Authentication Middleware (`backend/middleware/auth.js`)
- `isAuthenticated` - Check if user is logged in
- `isAdmin` - Check if user is admin
- `isEmployee` - Check if user is employee/staff
- `redirectIfAuthenticated` - Redirect if already logged in
- `noCacheMiddleware` - Prevent browser caching of protected pages

### Database Middleware (`backend/middleware/database.js`)
- `ensureDBConnection` - Ensure MongoDB connection before route execution

---

## 🛠️ Utilities

### SMS Utility (`backend/utils/sms.js`)
- `sendBillSMS()` - Send bill details via SMS (Twilio)

### Timezone Utility (`backend/utils/timezone.js`)
- `formatToIST()` - Convert UTC to IST format
- `getDateTimeSeparate()` - Get date and time separately
- `formatForBill()` - Format date/time for bill printing
- `getCurrentTime()` - Get current time in UTC
- `addTimezoneToLocals()` - Middleware to add helpers to views

---

## 🎨 View Engine

- **Template Engine**: EJS (Embedded JavaScript)
- **CSS Framework**: Bootstrap 5.3.0
- **Icons**: Bootstrap Icons 1.11.1
- **JavaScript**: Vanilla JS + Bootstrap Bundle

---

## 🚀 Key Features

### ✅ Branch Management
- Admin can view all branches
- Each employee belongs to a branch
- Sales are grouped by branch
- Branch-wise reports and analytics

### ✅ Role-Based Access Control
- **Admin**: Full access to all features
- **Staff/Employee**: Limited access based on branch

### ✅ Sales Management
- Create new sales with cart system
- Backend price validation (security)
- Automatic bill generation
- SMS notification support
- Print bill functionality
- Due payment tracking
- Sale cancellation with refund

### ✅ Inventory Management
- Add/Edit/Delete products
- Stock tracking
- Category-based organization
- Low stock alerts

### ✅ Reports & Analytics
- Daily/Weekly/Monthly sales reports
- Branch-wise performance
- Expense tracking
- Profit/loss calculations
- Visual charts and graphs

### ✅ Security Features
- Password hashing (bcryptjs)
- JWT token authentication
- Session management
- Back-button protection after logout
- Cache control headers
- CSRF protection

### ✅ Timezone Management
- All dates stored in UTC (MongoDB)
- Display in IST (Asia/Kolkata)
- Consistent time across UI and database

---

## 📱 Responsive Design

- Mobile-first approach
- Bootstrap responsive grid
- Touch-friendly UI elements
- Hamburger menu for mobile

---

## 🔄 Data Flow (MVC Pattern)

```
User Request
    ↓
[Route Handler] (Controller)
    ↓
[Middleware] (Auth, Database)
    ↓
[Model] (Database Query)
    ↓
[View] (EJS Template)
    ↓
HTML Response to User
```

---

## 🌐 Environment Variables

Required in `.env` file:
```
MONGODB_URI=<MongoDB connection string>
SESSION_SECRET=<Random secret key>
JWT_SECRET=<JWT secret key>
PORT=3000
TWILIO_ACCOUNT_SID=<Twilio SID>
TWILIO_AUTH_TOKEN=<Twilio token>
TWILIO_PHONE_NUMBER=<Twilio phone>
EMAIL_USER=<Email for notifications>
EMAIL_PASS=<Email password>
NODE_ENV=development
```

---

## 📦 Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-session` - Session management
- `cookie-parser` - Cookie parsing
- `dotenv` - Environment variables
- `luxon` - Timezone handling
- `twilio` - SMS service
- `nodemailer` - Email service

### Frontend
- `ejs` - Template engine
- `bootstrap` - CSS framework
- `bootstrap-icons` - Icon library

---

## 🎯 Entry Point

**File**: `server.js`

**Port**: 3000 (default)

**Start Command**: 
```bash
node server.js
# or
npm start
```

---

## 📚 Documentation Files

- `README.md` - Project overview
- `INSTALLATION.md` - Installation guide
- `AUTHENTICATION.md` - Auth system docs
- `TIMEZONE_FIX.md` - Timezone handling
- `BILLING_SECURITY.md` - Security features
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `MVC_STRUCTURE.md` - This file

---

**Last Updated**: November 28, 2025
**Version**: 2.0
**Branch**: respo
