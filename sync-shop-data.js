/**
 * 🔄 Sync Shop Data Between Profile & GST Settings
 * 
 * Usage:
 * node sync-shop-data.js --profile-to-gst    (Profile data → GST Settings)
 * node sync-shop-data.js --gst-to-profile    (GST Settings → Profile)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const args = process.argv.slice(2);
const syncMode = args[0];

if (!syncMode || (syncMode !== '--profile-to-gst' && syncMode !== '--gst-to-profile')) {
    console.log('❌ Invalid command!\n');
    console.log('Usage:');
    console.log('  node sync-shop-data.js --profile-to-gst    (Profile → GST Settings)');
    console.log('  node sync-shop-data.js --gst-to-profile    (GST Settings → Profile)\n');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bireena_bakery')
    .then(() => {
        console.log('✅ MongoDB connected\n');
        syncData();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function syncData() {
    try {
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
            email: String,
            updatedAt: Date
        }));

        const admin = await User.findOne({ role: 'admin' });
        const gstSettings = await GSTSettings.findOne();

        if (!admin) {
            console.error('❌ Admin user not found!');
            process.exit(1);
        }

        if (!gstSettings) {
            console.error('❌ GST Settings not found! Run setup-gst-settings.js first.');
            process.exit(1);
        }

        if (syncMode === '--profile-to-gst') {
            // Profile → GST Settings
            console.log('🔄 Syncing: Profile Data → GST Settings\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('BEFORE (GST Settings):');
            console.log('Business Name:', gstSettings.businessName);
            console.log('GSTIN:', gstSettings.gstin);
            console.log('Address:', gstSettings.address);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            // Extract state code from GSTIN
            let stateCode = gstSettings.stateCode;
            let stateName = gstSettings.stateName;
            
            if (admin.shopGST && admin.shopGST.length >= 2) {
                stateCode = admin.shopGST.substring(0, 2);
                // You can add a state code to name mapping here if needed
            }

            await GSTSettings.updateOne({}, {
                $set: {
                    businessName: admin.shopName || gstSettings.businessName,
                    gstin: admin.shopGST || gstSettings.gstin,
                    address: admin.shopAddress || gstSettings.address,
                    stateCode: stateCode,
                    updatedAt: new Date()
                }
            });

            console.log('✅ SYNC COMPLETE!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('AFTER (GST Settings):');
            console.log('Business Name:', admin.shopName);
            console.log('GSTIN:', admin.shopGST);
            console.log('Address:', admin.shopAddress);
            console.log('State Code:', stateCode);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        } else if (syncMode === '--gst-to-profile') {
            // GST Settings → Profile
            console.log('🔄 Syncing: GST Settings → Profile Data\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('BEFORE (Profile):');
            console.log('Shop Name:', admin.shopName);
            console.log('Shop GST:', admin.shopGST);
            console.log('Shop Address:', admin.shopAddress);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            await User.updateOne(
                { role: 'admin' },
                {
                    $set: {
                        shopName: gstSettings.businessName,
                        shopGST: gstSettings.gstin,
                        shopAddress: gstSettings.address
                    }
                }
            );

            console.log('✅ SYNC COMPLETE!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('AFTER (Profile):');
            console.log('Shop Name:', gstSettings.businessName);
            console.log('Shop GST:', gstSettings.gstin);
            console.log('Shop Address:', gstSettings.address);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

        console.log('🎉 Data successfully synced!');
        console.log('✅ Ab dono jagah same data hai.\n');
        console.log('Verify karne ke liye:');
        console.log('1. Profile page check karo: http://localhost:3000/profile');
        console.log('2. Ya run karo: node check-shop-data.js\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing data:', error);
        process.exit(1);
    }
}
