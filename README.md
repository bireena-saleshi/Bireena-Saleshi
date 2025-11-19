# Bireena Bakery Management System

Complete bakery management system with inventory, sales, billing, SMS notifications, and admin authentication.

## Features

- 🔐 **Login Authentication** - Secure admin login system
- 📦 **Stock Management** - Track and manage bakery inventory
- 💰 **Sales Management** - Record and manage sales transactions
- 🎁 **Special Discounts** - Apply discounts to items and bills
- 📱 **SMS Notifications** - Send bills via SMS to customers
- 🧾 **Billing Section** - Generate and print bills
- 📊 **Inventory Management** - Real-time stock tracking
- 👨‍💼 **Admin Dashboard** - Complete admin control panel

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Twilio Account (for SMS features)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB:
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/bireena_bakery`

3. Configure environment variables:
   - Edit `.env` file
   - Add your Twilio credentials for SMS features
   - Change default admin credentials

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

5. Open browser and navigate to:
```
http://localhost:3000
```

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change default credentials in production!

## SMS Setup

1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Update `.env` file with your credentials

## Usage

1. **Login** - Use admin credentials to login
2. **Manage Inventory** - Add products and manage stock levels
3. **Create Sales** - Process sales and generate bills
4. **Apply Discounts** - Add special discounts to items
5. **Send SMS** - Send bill details to customers via SMS
6. **View Reports** - Check sales reports and inventory status

## Project Structure

```
bireena-bakery/
├── models/          # Database models
├── routes/          # Express routes
├── views/           # EJS templates
├── public/          # Static files (CSS, JS, images)
├── middleware/      # Authentication middleware
├── utils/           # Utility functions (SMS, etc.)
├── server.js        # Main application file
├── .env             # Environment variables
└── package.json     # Project dependencies
```

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Template Engine:** EJS
- **Authentication:** JWT, bcryptjs
- **SMS:** Twilio API
- **Frontend:** HTML, CSS, JavaScript, Bootstrap

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Session management with express-session
- Environment variables for sensitive data

## Support

For issues or questions, please create an issue in the repository.

## License

ISC
