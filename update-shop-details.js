/**
 * 🏪 Apni Dukaan Ka Data Update Karo
 * 
 * INSTRUCTIONS:
 * 1. Neeche apna data fill karo
 * 2. Save karo (Ctrl+S)
 * 3. Run karo: node update-shop-details.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// ========================================
// 📝 YAHAN APNA DATA FILL KARO
// ========================================

const SHOP_DATA = {
    // Dukaan ka naam (Exactly jo bill pe print hoga)
    businessName: "Bireena Saleshi",
    
    // Apna 15 digit GSTIN number
    // Format: 27XXXXX0000X1Z5
    // Agar abhi nahi hai toh "27XXXXX0000X1Z5" hi rakho (test mode)
    gstin: "27XXXXX0000X1Z5",
    
    // Apna state code (2 digit)
    // Maharashtra = 27, Delhi = 07, Karnataka = 29, etc.
    stateCode: "27",
    
    // Apna state naam
    stateName: "Patna",
    
    // Dukaan ka pura address (bill pe print hoga)
    address: "Shop No. 5, Main Market, Patna",
    
    // Apni area ki pincode
    pincode: "800001",
    
    // Phone number (optional - bill pe dikhega)
    phone: "9876543210",
    
    // Email (optional)
    email: "bireena.bakery@example.com"
};

// ========================================
// GST TAX RATES (Change mat karo usually)
// ========================================

const TAX_RATES = {
    // Intra-state (same state) ke liye
    cgstRate: 2.5,  // Central GST
    sgstRate: 2.5,  // State GST
    
    // Inter-state (different state) ke liye
    igstRate: 5.0   // Integrated GST
};

// ========================================
// HSN CODE (Bakery products ke liye)
// ========================================

const HSN_SETTINGS = {
    // Default HSN code jo sabhi products pe lagega
    // 19059020 = Cakes, Pastries, Buns
    defaultHSNCode: "19059020"
};

// ========================================
// AUTO UPDATE CODE (Yahan kuch change mat karo)
// ========================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bireena_bakery')
    .then(() => {
        console.log('✅ MongoDB se connected ho gaya\n');
        updateShopDetails();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function updateShopDetails() {
    try {
        const GSTSettings = mongoose.model('GSTSettings', new mongoose.Schema({
            businessName: String,
            gstin: String,
            stateCode: String,
            stateName: String,
            address: String,
            pincode: String,
            phone: String,
            email: String,
            defaultCGSTRate: Number,
            defaultSGSTRate: Number,
            defaultIGSTRate: Number,
            defaultHSNCode: String,
            enableGST: Boolean,
            updatedAt: Date
        }));

        // Check if settings exist
        const existing = await GSTSettings.findOne();
        
        if (!existing) {
            console.log('⚠️ GST Settings nahi mile!');
            console.log('Pehle setup-gst-settings.js run karo\n');
            process.exit(1);
        }

        // Update with new data
        const result = await GSTSettings.updateOne({}, {
            $set: {
                businessName: SHOP_DATA.businessName,
                gstin: SHOP_DATA.gstin,
                stateCode: SHOP_DATA.stateCode,
                stateName: SHOP_DATA.stateName,
                address: SHOP_DATA.address,
                pincode: SHOP_DATA.pincode,
                phone: SHOP_DATA.phone,
                email: SHOP_DATA.email,
                defaultCGSTRate: TAX_RATES.cgstRate,
                defaultSGSTRate: TAX_RATES.sgstRate,
                defaultIGSTRate: TAX_RATES.igstRate,
                defaultHSNCode: HSN_SETTINGS.defaultHSNCode,
                updatedAt: new Date()
            }
        });

        console.log('🎉 Shop details successfully update ho gaye!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 UPDATED SHOP DETAILS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏪 Business Name:', SHOP_DATA.businessName);
        console.log('🔢 GSTIN:', SHOP_DATA.gstin);
        console.log('📍 State:', SHOP_DATA.stateName, `(Code: ${SHOP_DATA.stateCode})`);
        console.log('📮 Address:', SHOP_DATA.address);
        console.log('📌 Pincode:', SHOP_DATA.pincode);
        if (SHOP_DATA.phone) console.log('📞 Phone:', SHOP_DATA.phone);
        if (SHOP_DATA.email) console.log('📧 Email:', SHOP_DATA.email);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💰 TAX RATES:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   CGST:', TAX_RATES.cgstRate + '%');
        console.log('   SGST:', TAX_RATES.sgstRate + '%');
        console.log('   IGST:', TAX_RATES.igstRate + '%');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 HSN CODE:', HSN_SETTINGS.defaultHSNCode);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        console.log('✅ Ab ye details sab bills pe print hongi!');
        console.log('✅ GST calculations is data se hongi!\n');
        
        // Also update admin user's shopGST
        const User = mongoose.model('User', new mongoose.Schema({
            role: String,
            shopGST: String,
            shopName: String
        }));
        
        await User.updateOne(
            { role: 'admin' },
            { 
                $set: { 
                    shopGST: SHOP_DATA.gstin,
                    shopName: SHOP_DATA.businessName
                }
            }
        );
        
        console.log('✅ Admin user bhi update ho gaya!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating shop details:', error);
        process.exit(1);
    }
}
