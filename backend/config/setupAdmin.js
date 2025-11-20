require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Default admin credentials
const ADMIN_CREDENTIALS = {
    fullName: 'Admin',
    username: 'admin',
    email: 'admin@bireenabakery.com',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin'
};

async function setupAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: ADMIN_CREDENTIALS.username });

        if (existingAdmin) {
            console.log('\n✅ Admin account already exists!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
            // Create new admin
            const admin = new User(ADMIN_CREDENTIALS);
            await admin.save();

            console.log('\n✅ Admin account created successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Username:', ADMIN_CREDENTIALS.username);
            console.log('Password:', ADMIN_CREDENTIALS.password);
            console.log('Email:', ADMIN_CREDENTIALS.email);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
        }

        console.log('\n🚀 You can now login at: http://localhost:3000');
        console.log('   Use "Admin Login" tab with above credentials\n');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

setupAdmin();
