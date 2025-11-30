/**
 * 🔄 Shop Data Sync Script
 * 
 * Ye script User aur GSTSettings dono ko sync karega
 * Aap choose kar sakte ho kis data se sync karna hai
 */

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bireena_bakery')
    .then(() => {
        console.log('✅ MongoDB connected\n');
        showCurrentData();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function showCurrentData() {
    try {
        // Define schemas
        const User = mongoose.model('User', new mongoose.Schema({
            role: String,
            shopName: String,
            shopGST: String,
            shopAddress: String
        }));

        const GSTSettings = mongoose.model('GSTSettings', new mongoose.Schema({
            businessName: String,
            gstin: String,
            address: String,
            stateCode: String,
            stateName: String,
            pincode: String,
            phone: String,
            email: String
        }));

        // Fetch data
        const admin = await User.findOne({ role: 'admin' });
        const gstSettings = await GSTSettings.findOne();

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 CURRENT DATA COMPARISON');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('👤 PROFILE PAGE (User Collection):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Shop Name:', admin?.shopName || 'Not set');
        console.log('GST Number:', admin?.shopGST || 'Not set');
        console.log('Address:', admin?.shopAddress || 'Not set');
        console.log('');

        console.log('💰 GST SYSTEM (GSTSettings Collection):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Business Name:', gstSettings?.businessName || 'Not set');
        console.log('GSTIN:', gstSettings?.gstin || 'Not set');
        console.log('Address:', gstSettings?.address || 'Not set');
        console.log('State:', gstSettings?.stateName || 'Not set', `(${gstSettings?.stateCode || 'N/A'})`);
        console.log('Pincode:', gstSettings?.pincode || 'Not set');
        console.log('Phone:', gstSettings?.phone || 'Not set');
        console.log('');

        // Check if data matches
        const nameMatch = admin?.shopName === gstSettings?.businessName;
        const gstMatch = admin?.shopGST === gstSettings?.gstin;
        const addressMatch = admin?.shopAddress === gstSettings?.address;

        console.log('🔍 DATA COMPARISON:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Shop Name match:', nameMatch ? '✅ Yes' : '❌ No');
        console.log('GST Number match:', gstMatch ? '✅ Yes' : '❌ No');
        console.log('Address match:', addressMatch ? '✅ Yes' : '❌ No');
        console.log('');

        if (nameMatch && gstMatch && addressMatch) {
            console.log('🎉 Sab data sync hai! Koi problem nahi.\n');
            process.exit(0);
        } else {
            console.log('⚠️  Data mismatch hai! Sync karna padega.\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔧 SYNC OPTIONS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('Option 1: Profile → GST Settings sync karo');
            console.log('Command: node sync-shop-data.js --profile-to-gst\n');
            console.log('Option 2: GST Settings → Profile sync karo');
            console.log('Command: node sync-shop-data.js --gst-to-profile\n');
            console.log('Option 3: Manually dono ko same karo');
            console.log('- Profile edit karo: http://localhost:3000/profile');
            console.log('- Ya update-shop-details.js edit karke run karo\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
