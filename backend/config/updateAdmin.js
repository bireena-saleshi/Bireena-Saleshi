require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function updateAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');

        // Find and update admin
        const admin = await User.findOne({ username: 'admin', role: 'admin' });

        if (admin) {
            admin.fullName = admin.fullName || 'Admin';
            admin.email = admin.email || 'admin@bireenabakery.com';
            admin.phone = admin.phone || '9999999999';
            await admin.save();

            console.log('\n✅ Admin account updated successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Full Name:', admin.fullName);
            console.log('Username:', admin.username);
            console.log('Email:', admin.email);
            console.log('Phone:', admin.phone);
            console.log('Role:', admin.role);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n🔐 Login Credentials:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('\n🚀 Login at: http://localhost:3000');
        } else {
            console.log('❌ Admin not found. Creating new admin...');
            
            const newAdmin = new User({
                fullName: 'Admin',
                username: 'admin',
                email: 'admin@bireenabakery.com',
                phone: '9999999999',
                password: 'admin123',
                role: 'admin'
            });
            await newAdmin.save();
            
            console.log('\n✅ New Admin created!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

    } catch (error) {
        console.error('❌ Update failed:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

updateAdmin();
