# 🔐 Quick Reference - Login Credentials

## Default Admin Account
```
URL:      http://localhost:3000
Tab:      Admin
Username: admin
Password: admin123
```

---

## Test Employee Account (Create First)

### Step 1: Create Employee as Admin
1. Login as admin (use credentials above)
2. Navigate to: **Employees → Add Employee**
3. Fill the form:
   ```
   Full Name:        Test Employee
   Username:         testemp
   Email:            test@example.com
   Phone:            1234567890 (optional)
   Password:         test123456
   Confirm Password: test123456
   ```
4. Click **Add Employee**
5. Note the credentials displayed

### Step 2: Test Employee Login
1. Logout from admin account
2. Return to login page: http://localhost:3000
3. Click **Employee** tab
4. Use credentials:
   ```
   Username: testemp
   Password: test123456
   ```
   OR
   ```
   Username: test@example.com
   Password: test123456
   ```
5. Click **Login as Employee**

---

## Quick Test Checklist

### ✅ Admin Tests
- [ ] Admin login with correct credentials
- [ ] Admin login with wrong password (should fail)
- [ ] Create new employee account
- [ ] View employees list
- [ ] Access all dashboard features

### ✅ Employee Tests
- [ ] Employee login with username
- [ ] Employee login with email
- [ ] Employee login with wrong password (should fail)
- [ ] Access employee dashboard
- [ ] Verify limited access (compared to admin)

### ✅ Security Tests
- [ ] Logout functionality
- [ ] Session persistence
- [ ] Duplicate username prevention
- [ ] Duplicate email prevention
- [ ] Password length validation (min 6)
- [ ] Password confirmation matching
- [ ] Phone number validation (10 digits)

---

## Common Test Scenarios

### Scenario 1: Fresh Installation
```
1. Start server: node server.js
2. Open: http://localhost:3000
3. Login as admin (creates default admin on first login)
4. Success!
```

### Scenario 2: Create Multiple Employees
```
Employee 1:
  Username: emp001
  Email: emp001@bakery.com
  Password: emp123

Employee 2:
  Username: emp002
  Email: emp002@bakery.com
  Password: emp123

Employee 3:
  Username: cashier1
  Email: cashier@bakery.com
  Password: cash123
```

### Scenario 3: Test All Login Methods
```
✓ Admin login with username: admin
✓ Employee login with username: testemp
✓ Employee login with email: test@example.com
```

---

## Error Messages Reference

### Admin Login
| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Username and password are required" | Missing field | Fill both fields |
| "Invalid admin credentials" | Wrong username/password | Check credentials |
| "Session expired" | JWT expired | Login again |

### Employee Login
| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Username and password are required" | Missing field | Fill both fields |
| "Invalid employee credentials" | Wrong username/password/not found | Verify account exists |

### Employee Creation
| Error Message | Cause | Solution |
|---------------|-------|----------|
| "All fields are required" | Missing required field | Fill all required fields |
| "Username already exists" | Duplicate username | Choose different username |
| "Email already exists" | Duplicate email | Choose different email |
| "Passwords do not match" | Mismatch in password fields | Ensure passwords match |
| "Password must be at least 6 characters" | Short password | Use 6+ characters |
| "Please enter a valid 10-digit phone number" | Invalid phone | Use exactly 10 digits |

---

## API Testing with cURL

### Admin Login
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Employee Login
```bash
curl -X POST http://localhost:3000/employee/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testemp","password":"test123456"}'
```

### Create Employee (requires admin session)
```bash
curl -X POST http://localhost:3000/employee/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=YOUR_ADMIN_TOKEN" \
  -d '{
    "fullName":"New Employee",
    "username":"newemp",
    "email":"new@example.com",
    "password":"pass123",
    "confirmPassword":"pass123"
  }'
```

---

## Browser DevTools Testing

### Check Session
```javascript
// In browser console
document.cookie
```

### Check Local Storage
```javascript
localStorage
```

### Monitor Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Submit login form
4. Check request/response
5. Verify status codes:
   - 200: Success
   - 400: Bad request
   - 401: Unauthorized
   - 403: Forbidden
```

---

## Database Queries (MongoDB)

### View all admins
```javascript
db.users.find({ role: 'admin' })
```

### View all employees
```javascript
db.users.find({ role: 'staff' })
```

### Count users by role
```javascript
db.users.aggregate([
  { $group: { _id: '$role', count: { $sum: 1 } } }
])
```

### Find user by username
```javascript
db.users.findOne({ username: 'admin' })
```

### Delete test employee
```javascript
db.users.deleteOne({ username: 'testemp' })
```

---

## Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
node server.js
```

### MongoDB connection failed
```
1. Check MONGODB_URI in .env
2. Verify network connection
3. Check MongoDB Atlas whitelist
4. Ensure credentials are correct
```

### Login not working
```
1. Clear browser cookies
2. Check server console for errors
3. Verify MongoDB is connected
4. Check network tab in DevTools
5. Ensure server is running
```

### Employee creation fails
```
1. Ensure logged in as admin
2. Check all required fields filled
3. Verify unique username/email
4. Check password length (6+)
5. Ensure passwords match
```

---

## Quick Commands

```bash
# Start server
cd "c:\Users\LOQ\OneDrive\Desktop\bakery\Bireena-Saleshi"
node server.js

# Run tests
node test-auth.js

# Check MongoDB connection
# (Server logs will show connection status)

# Access application
# http://localhost:3000
```

---

## Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Set strong SESSION_SECRET
- [ ] Enable HTTPS
- [ ] Set secure: true for cookies
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Test all functionality
- [ ] Review security settings

---

**Last Updated: November 19, 2025**
