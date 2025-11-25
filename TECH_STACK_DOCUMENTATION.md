# 🏪 BIREENA SALESI - TECH STACK DOCUMENTATION

## Project Overview
**Project Name:** Bireena Salesi (Bakery Management System)  
**Version:** 2.0.0  
**Type:** Full-Stack Web Application  
**Purpose:** Complete bakery/shop management with billing, inventory, sales tracking, and employee management  

---

## 🎯 COMPLETE TECH STACK

### **1. BACKEND TECHNOLOGIES**

#### **Core Framework**
- **Node.js** (v14+)
  - JavaScript runtime environment
  - Event-driven, non-blocking I/O
  - Used for: Server-side logic and API

- **Express.js** (v4.18.2)
  - Fast, minimalist web framework
  - Used for: Routing, middleware, HTTP requests
  - Features: RESTful API, session handling

#### **Database**
- **MongoDB** (v7.6.3)
  - NoSQL document database
  - Used for: Storing users, products, sales, expenses
  - Cloud: MongoDB Atlas

- **Mongoose ODM** (v7.6.3)
  - MongoDB object modeling
  - Used for: Schema validation, relationships, queries
  - Features: Middleware, virtual properties

#### **Authentication & Security**
- **JSON Web Tokens (JWT)** (v9.0.2)
  - Token-based authentication
  - Used for: Secure user sessions (24-hour expiry)

- **bcryptjs** (v2.4.3)
  - Password hashing library
  - Used for: Encrypting user passwords (12 salt rounds)
  - Security: One-way encryption

- **express-session** (v1.17.3)
  - Session middleware
  - Used for: User session management, cookies

- **cookie-parser** (v1.4.7)
  - Parse cookies in HTTP requests
  - Used for: Reading auth tokens from cookies

#### **Email & SMS**
- **Nodemailer** (v7.0.10)
  - Email sending library
  - Used for: Contact form submissions, notifications

- **Twilio** (v4.19.0)
  - SMS API service
  - Used for: SMS notifications (optional)

#### **Middleware & Utilities**
- **body-parser** (v1.20.2)
  - Parse incoming request bodies
  - Used for: JSON and URL-encoded data

- **connect-flash** (v0.1.1)
  - Flash messages middleware
  - Used for: Success/error notifications

- **method-override** (v3.0.0)
  - HTTP method override
  - Used for: PUT/DELETE in forms

- **dotenv** (v16.3.1)
  - Environment variable loader
  - Used for: Configuration management (.env file)

---

### **2. FRONTEND TECHNOLOGIES**

#### **Template Engine**
- **EJS (Embedded JavaScript)** (v3.1.9)
  - Server-side templating
  - Used for: Dynamic HTML rendering
  - Features: Partials, layouts, conditionals

#### **CSS Framework & Icons**
- **Bootstrap 5.3.0**
  - CSS framework for responsive design
  - Used for: Grid system, utilities
  - Icons: Bootstrap Icons

#### **Custom Frontend Stack**
- **Vanilla JavaScript**
  - Client-side interactivity
  - Used for: Form validation, AJAX requests, animations

- **Custom CSS**
  - Modern design system
  - Features:
    - CSS Variables (color scheme)
    - Flexbox & Grid layouts
    - Gradient animations
    - Glassmorphism effects
    - Responsive breakpoints (1280px, 1024px, 768px, 480px)

#### **Fonts**
- **Google Fonts**
  - Poppins (body text)
  - Playfair Display (headings)
  - Used for: Professional typography

---

### **3. DEVELOPMENT TOOLS**

#### **Development Server**
- **Nodemon** (v3.0.1)
  - Auto-restart server on file changes
  - Used for: Development workflow
  - Command: `npm run dev`

#### **Code Quality**
- **ejs-lint** (v2.0.1)
  - EJS template linter
  - Used for: Catching template errors

---

### **4. DEPLOYMENT & HOSTING**

#### **Platform**
- **Vercel**
  - Serverless deployment platform
  - Used for: Production hosting
  - Features: Auto-deployment from GitHub
  - URL: https://bakery-management-zeta.vercel.app/

#### **Version Control**
- **Git & GitHub**
  - Source code management
  - Repositories:
    - https://github.com/bireena-saleshi/Bireena-Saleshi
    - https://github.com/chikkucoder/Bakery-Management

---

## 🔧 TECH STACK PURPOSE MAPPING

### **Why Each Technology?**

| Technology | Purpose | Reason for Choice |
|------------|---------|-------------------|
| **Node.js** | Backend runtime | Fast, scalable, JavaScript everywhere |
| **Express.js** | Web framework | Lightweight, flexible routing |
| **MongoDB** | Database | Flexible schema, easy scaling |
| **Mongoose** | ODM | Schema validation, relationships |
| **JWT** | Authentication | Stateless, secure tokens |
| **bcrypt** | Password security | Industry standard encryption |
| **EJS** | Templating | Server-side rendering, SEO friendly |
| **Bootstrap** | UI framework | Rapid responsive design |
| **Vercel** | Hosting | Easy deployment, serverless |
| **Nodemailer** | Email | Free, reliable email sending |

---

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  HTML (EJS) + CSS + JavaScript                   │   │
│  │  Bootstrap 5 + Custom Styling                    │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│              EXPRESS.JS SERVER (Node.js)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                │   │
│  │  • Body Parser • Cookie Parser                   │   │
│  │  • Session • Flash Messages                      │   │
│  │  • Authentication (JWT)                          │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes Layer                                    │   │
│  │  • /auth (Login/Logout)                          │   │
│  │  • /dashboard • /inventory • /sales              │   │
│  │  • /employees • /reports • /billing              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Business Logic (Controllers)                    │   │
│  │  • User Management • Product CRUD                │   │
│  │  • Sales Processing • Reports Generation         │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     ↓
┌─────────────────────────────────────────────────────────┐
│              MONGODB DATABASE (Atlas)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Collections:                                    │   │
│  │  • users (Admin & Employees)                     │   │
│  │  • products (Inventory items)                    │   │
│  │  • sales (Transaction records)                   │   │
│  │  • expenses (Business expenses)                  │   │
│  │  • discounts (Promotional offers)                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ DATABASE SCHEMA

### **Collections & Models**

#### **1. Users Collection**
```javascript
{
  fullName: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (admin/staff),
  phoneNumber: String,
  address: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

#### **2. Products Collection**
```javascript
{
  name: String,
  category: String,
  price: Number,
  stock: Number,
  reorderLevel: Number,
  unit: String,
  description: String,
  addedBy: ObjectId (User reference),
  createdAt: Date
}
```

#### **3. Sales Collection**
```javascript
{
  items: [{
    product: ObjectId (Product reference),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  discount: Number,
  finalAmount: Number,
  paymentMethod: String,
  createdBy: ObjectId (User reference),
  createdAt: Date
}
```

#### **4. Expenses Collection**
```javascript
{
  category: String,
  amount: Number,
  description: String,
  date: Date,
  addedBy: ObjectId (User reference)
}
```

#### **5. Discounts Collection**
```javascript
{
  name: String,
  type: String (percentage/fixed),
  value: Number,
  isActive: Boolean,
  startDate: Date,
  endDate: Date
}
```

---

## 🔐 SECURITY FEATURES

1. **Password Security**
   - bcrypt hashing (12 salt rounds)
   - No plain text storage

2. **Authentication**
   - JWT tokens (24-hour expiry)
   - HttpOnly cookies (XSS protection)
   - Secure session management

3. **Authorization**
   - Role-based access control (RBAC)
   - Admin vs Employee permissions
   - Route protection middleware

4. **Data Validation**
   - Mongoose schema validation
   - Input sanitization
   - Email format validation

5. **Environment Security**
   - .env file for secrets
   - Environment variables
   - No credentials in code

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**
- **Desktop:** 1280px+
- **Laptop:** 1024px - 1279px
- **Tablet:** 768px - 1023px
- **Mobile:** 480px - 767px
- **Small Mobile:** < 480px

### **Features**
- Hamburger menu navigation
- Touch-friendly buttons
- Responsive cards and tables
- Mobile-optimized forms
- Adaptive font sizes

---

## 🎨 UI/UX FEATURES

1. **Design System**
   - Purple-Cyan gradient theme
   - Glassmorphism effects
   - Neon glow shadows
   - Smooth animations

2. **Interactive Elements**
   - Hover effects
   - Loading states
   - Toast notifications
   - Flash messages

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Focus indicators
   - Semantic HTML

---

## 📈 PERFORMANCE OPTIMIZATIONS

1. **Backend**
   - MongoDB indexing
   - Mongoose query optimization
   - Session caching
   - Middleware optimization

2. **Frontend**
   - CSS minification
   - Image optimization
   - Lazy loading
   - Efficient JavaScript

3. **Deployment**
   - Serverless architecture (Vercel)
   - CDN delivery
   - Environment-based configs

---

## 🚀 DEPLOYMENT PROCESS

1. **Development**
   ```bash
   npm run dev  # Nodemon auto-restart
   ```

2. **Production Build**
   ```bash
   npm start  # Node.js production mode
   ```

3. **Vercel Deployment**
   - Auto-deploy from GitHub push
   - Environment variables in Vercel dashboard
   - Serverless functions

---

## 📦 NPM PACKAGES (Complete List)

### **Production Dependencies (17)**
1. bcryptjs (^2.4.3) - Password hashing
2. body-parser (^1.20.2) - Request body parsing
3. connect-flash (^0.1.1) - Flash messages
4. cookie-parser (^1.4.7) - Cookie parsing
5. dotenv (^16.3.1) - Environment variables
6. ejs (^3.1.9) - Template engine
7. ejs-lint (^2.0.1) - EJS validation
8. express (^4.18.2) - Web framework
9. express-session (^1.17.3) - Session management
10. jsonwebtoken (^9.0.2) - JWT authentication
11. method-override (^3.0.0) - HTTP method override
12. mongoose (^7.6.3) - MongoDB ODM
13. nodemailer (^7.0.10) - Email service
14. twilio (^4.19.0) - SMS service

### **Development Dependencies (1)**
1. nodemon (^3.0.1) - Auto-restart server

**Total Package Size:** ~150 MB (with node_modules)

---

## 🔄 API FLOW EXAMPLE

### **Login Flow**
```
1. User enters credentials on /login page
   ↓
2. POST /admin/login or /employee/login
   ↓
3. Server validates credentials (bcrypt compare)
   ↓
4. Generate JWT token (24-hour expiry)
   ↓
5. Create express-session
   ↓
6. Set HttpOnly cookie
   ↓
7. Redirect to /dashboard
   ↓
8. Dashboard displays role-based content
```

---

## 🎓 LEARNING RESOURCES

### **For Understanding This Tech Stack:**

1. **Node.js & Express**
   - https://nodejs.org/docs
   - https://expressjs.com/

2. **MongoDB & Mongoose**
   - https://mongoosejs.com/docs/
   - https://university.mongodb.com/

3. **Authentication**
   - https://jwt.io/introduction
   - https://www.npmjs.com/package/bcryptjs

4. **EJS Templating**
   - https://ejs.co/#docs

5. **Vercel Deployment**
   - https://vercel.com/docs

---

## 👨‍💻 DEVELOPER INFO

**Developed By:** Bireena Infotech  
**Project Type:** Full-Stack Web Application  
**Development Time:** ~2 weeks  
**Code Quality:** Production-ready  
**Maintenance:** Active  

---

## 📊 PROJECT STATISTICS

- **Total Files:** 50+
- **Lines of Code:** ~15,000+
- **Backend Routes:** 25+
- **Database Models:** 5
- **Frontend Pages:** 15+
- **API Endpoints:** 30+

---

**Date Created:** November 23, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
