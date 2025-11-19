# 🏪 Bireena Saleshi - Bakery Management System

A comprehensive, modern bakery management system with **dual-role authentication**, inventory tracking, sales management, and employee activity monitoring.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

## ✨ Key Features

### 🔐 **Dual-Role Authentication System** (NEW!)
- **Admin Login** - Full system access with employee management
- **Employee Login** - Role-based dashboard access  
- Secure JWT token-based authentication
- Password hashing with bcrypt (12 rounds)
- Session management with express-session
- Real-time login notifications

### 👥 **User Management**
- Admin can create and manage employee accounts
- Role-based access control (Admin/Staff)
- Employee activity tracking
- Last login timestamps
- Account activation/deactivation

### 📦 **Inventory Management**
- Add, edit, delete products
- Real-time stock tracking
- Low stock alerts
- Product categories
- Price management

### 💰 **Sales & Billing**
- Create new sales with multiple items
- Apply discounts (percentage or fixed)
- Generate and print bills
- Payment validation
- Sales history and analytics

### 📊 **Reports & Analytics**
- Daily/Monthly revenue reports
- Product-wise sales analysis
- Employee performance tracking
- Expense management
- Profit calculations

### 🎨 **Modern UI/UX**
- Futuristic neon design with purple-pink gradients
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- 3D parallax effects
- Animated particles background
- Hamburger menu navigation

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sauryaaman/Bireena-Saleshi.git
cd Bireena-Saleshi
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create/edit `.env` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bireena_bakery

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Session Secret  
SESSION_SECRET=your_session_secret_key_here

# Default Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server Configuration
PORT=3000
NODE_ENV=development

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. **Start the server**
```bash
node server.js
```

5. **Access the application**
```
http://localhost:3000
```

### Default Login
**Admin Credentials:**
```
Username: admin
Password: admin123
```

⚠️ **Important:** Change default admin password after first login!

---

## 📚 Complete Documentation

- **[Authentication Guide](AUTHENTICATION_GUIDE.md)** - Dual-role authentication system
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Feature details
- **[Quick Reference](QUICK_REFERENCE.md)** - Testing guide & credentials
- **[Getting Started](GETTING_STARTED.md)** - Setup instructions

---

## 🔐 Authentication System

### How It Works

**Admin Login:**
1. Select "Admin" tab on login page
2. Enter admin username and password
3. System verifies credentials
4. Generates JWT token and creates session
5. Redirects to admin dashboard

**Employee Management:**
1. Admin logs in
2. Navigates to Employees → Add Employee
3. Fills employee details (name, username, email, password)
4. System validates and stores credentials
5. Employee can now login

**Employee Login:**
1. Select "Employee" tab on login page
2. Enter username/email and password
3. System verifies employee credentials
4. Redirects to employee dashboard (limited access)

### Security Features
✅ Bcrypt password hashing (12 rounds)  
✅ JWT tokens with 24-hour expiry  
✅ HttpOnly cookies (XSS protection)  
✅ Role-based access control  
✅ Session validation  
✅ Input sanitization  

---

## 📁 Project Structure

```
Bireena-Saleshi/
├── backend/
│   ├── config/          # Setup scripts
│   ├── middleware/      # Auth middleware
│   ├── models/          # Database schemas (User, Product, Sale, etc.)
│   ├── routes/          # API routes (auth, dashboard, inventory, etc.)
│   └── utils/           # Utilities (SMS, etc.)
├── frontend/
│   ├── public/          # Static files (CSS, JS, images)
│   └── views/           # EJS templates
├── .env                 # Environment variables
├── server.js            # Express server
├── package.json         # Dependencies
└── Documentation files  # AUTHENTICATION_GUIDE.md, etc.
```

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, Bcrypt, Express-Session
- **Template Engine:** EJS
- **Frontend:** Bootstrap 5.3.0, Bootstrap Icons
- **Styling:** Custom CSS with neon effects
- **Security:** bcrypt, jsonwebtoken, express-session

---

## 🎯 API Endpoints

### Authentication
- `POST /admin/login` - Admin authentication
- `POST /employee/login` - Employee authentication
- `POST /employee/create` - Create employee (Admin only)
- `GET/POST /logout` - Logout user

### Dashboard
- `GET /dashboard` - Main dashboard (role-based)

### Inventory
- `GET /inventory` - Product list
- `POST /inventory/add` - Add product
- `POST /inventory/edit/:id` - Edit product
- `DELETE /inventory/delete/:id` - Delete product

### Sales & Billing
- `GET /sales` - Sales history
- `POST /sales/new` - Create sale
- `GET /bill/view/:id` - View bill
- `GET /bill/print/:id` - Print bill

### Employees (Admin Only)
- `GET /employees` - Employee list
- `POST /employee/create` - Create employee
- `POST /employees/edit/:id` - Edit employee

### Reports
- `GET /reports` - Reports dashboard
- `POST /reports/add-expense` - Add expense

---

## 🧪 Testing

### Quick Test
1. Open http://localhost:3000
2. Login as admin (admin/admin123)
3. Create an employee account
4. Logout and login as employee
5. Verify role-based access

### Automated Testing
```bash
node test-auth.js
```

---

## 🎨 UI Features

- Futuristic neon purple-pink gradient theme
- Animated particle background
- 3D parallax tilt effects
- Smooth page transitions
- Responsive hamburger menu
- Real-time notifications
- Print-friendly bill layouts

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

---

## 👨‍💻 Author

**Sauryaaman**
- GitHub: [@sauryaaman](https://github.com/sauryaaman)
- Repository: [Bireena-Saleshi](https://github.com/sauryaaman/Bireena-Saleshi)

---

## 📝 License

ISC

---

**⭐ If you find this project helpful, please give it a star!**

*Last Updated: November 19, 2025*
