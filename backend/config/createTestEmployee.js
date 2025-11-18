require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createTestEmployee() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');

        // Check if test employee already exists
        const existingEmployee = await User.findOne({ email: 'employee@bireenabakery.com' });

        if (existingEmployee) {
            console.log('\n✅ Test Employee already exists!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Full Name:', existingEmployee.fullName);
            console.log('Employee ID:', existingEmployee.username);
            console.log('Email:', existingEmployee.email);
            console.log('Phone:', existingEmployee.phone);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
            // Create test employee
            const employee = new User({
                fullName: 'Test Employee',
                username: 'emp001',
                email: 'employee@bireenabakery.com',
                phone: '9876543210',
                password: 'emp123',
                role: 'staff'
            });
            await employee.save();

            console.log('\n✅ Test Employee created successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Full Name: Test Employee');
            console.log('Employee ID: emp001');
            console.log('Email: employee@bireenabakery.com');
            console.log('Phone: 9876543210');
            console.log('Password: emp123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        console.log('\n🔐 Employee Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email: employee@bireenabakery.com');
        console.log('Password: emp123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🚀 Login at: http://localhost:3000');
        console.log('   Use "Employee Login" tab\n');

    } catch (error) {
        console.error('❌ Failed:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

createTestEmployee();
