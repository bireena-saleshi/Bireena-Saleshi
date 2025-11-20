# Bireena Bakery - Admin & Employee Credentials Setup

## 🔐 Admin Login Credentials

**Admin credentials are stored in the database:**

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@bireenabakery.com`
- **Phone:** `9999999999`

### Login Steps:
1. Visit http://localhost:3000
2. Click on **"Admin Login"** tab
3. Enter username: `admin`
4. Enter password: `admin123`
5. Click Login

---

## 👥 Employee Management (Admin Feature)

Admin can create employee accounts with the following process:

### Adding New Employee:

1. **Login as Admin** (using above credentials)
2. Go to **Dashboard** → Click **"Employees"** from sidebar/menu
3. Click **"Add Employee"** button
4. Fill in the following details:
   - **Full Name** (Required): Employee's complete name
   - **Employee ID (Username)** (Required): Unique ID for login (e.g., emp001, emp002)
   - **Email Address** (Required): Employee's email for login
   - **Phone Number** (Optional): 10-digit phone number
   - **Password** (Required): Initial password for employee (minimum 6 characters)
5. Click **"Add Employee"**

### Employee Login:

Once admin creates an employee, they can login using:

1. Visit http://localhost:3000
2. Click on **"Employee Login"** tab
3. Enter **Email** (provided by admin)
4. Enter **Password** (provided by admin)
5. Click Login

---

## 📊 Admin Features:

✅ **Full Control:**
- Add new employees and create their Employee IDs
- Edit employee details (name, email, phone, password)
- Delete employees
- View all employees in system
- All bakery management features (inventory, sales, reports, etc.)

✅ **Employee ID Generation:**
- Admin assigns unique Employee ID (username) to each employee
- Employee ID is used for system identification
- Employee uses email for login (more user-friendly)

---

## 🗄️ Database Storage:

All credentials are securely stored in MongoDB database:
- **Passwords:** Encrypted using bcrypt (10 rounds hashing)
- **JWT Tokens:** Stored in HTTP-only cookies (24-hour expiry)
- **Session Data:** Managed with express-session
- **Database:** MongoDB Atlas Cloud Database

### Database Connection:
```
Database: bireena_bakery
Collection: users
Fields: fullName, username, email, phone, password (hashed), role, createdAt
```

---

## 🚀 Quick Setup Commands:

### Initialize Admin (if not exists):
```bash
node backend/config/setupAdmin.js
```

### Update Existing Admin:
```bash
node backend/config/updateAdmin.js
```

### Start Server:
```bash
npm start
```

---

## 🔒 Security Features:

1. **Password Hashing:** All passwords encrypted with bcrypt
2. **JWT Authentication:** Secure token-based authentication
3. **HTTP-Only Cookies:** Tokens stored securely, not accessible via JavaScript
4. **Role-Based Access:** Admin vs Employee permissions
5. **Session Management:** Secure session handling
6. **Input Validation:** All forms validated on client and server side

---

## 📱 Employee Credentials Format:

When admin creates employee, the system generates:

```
Full Name: Rahul Kumar
Employee ID: emp001
Email: rahul@example.com
Phone: 9876543210
Password: (set by admin)
Role: staff
```

Employee receives these credentials from admin and can login immediately!

---

## ⚠️ Important Notes:

1. **Change Default Admin Password:** After first login, admin should change password
2. **Secure Employee Passwords:** Use strong passwords when creating employee accounts
3. **Keep Credentials Safe:** Admin credentials should be kept secure
4. **Email Uniqueness:** Each employee must have unique email
5. **Username Uniqueness:** Each employee must have unique Employee ID

---

## 🎯 System Flow:

```
1. Admin logs in with username/password
   ↓
2. Admin goes to Employee Management section
   ↓
3. Admin creates new employee with:
   - Full Name, Employee ID, Email, Phone, Password
   ↓
4. Employee details stored in database
   ↓
5. Admin gives credentials to employee
   ↓
6. Employee logs in using email/password
   ↓
7. Both can use bakery system features!
```

---

**All credentials are now stored in MongoDB database and managed through the admin panel! 🎉**
