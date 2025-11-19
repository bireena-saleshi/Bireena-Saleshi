const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let client;
// Only initialize Twilio if valid credentials are provided
if (accountSid && authToken && twilioPhone && 
    accountSid.startsWith('AC') && authToken.length > 10) {
    try {
        client = twilio(accountSid, authToken);
    } catch (error) {
        console.log('Twilio initialization failed:', error.message);
        client = null;
    }
}

const sendBillSMS = async (phoneNumber, billData) => {
    if (!client) {
        console.log('Twilio not configured. SMS not sent.');
        return { success: false, message: 'Twilio not configured' };
    }

    try {
        // Format phone number (add country code if not present)
        let formattedPhone = phoneNumber;
        if (!phoneNumber.startsWith('+')) {
            formattedPhone = '+91' + phoneNumber; // Default to India, change as needed
        }

        const message = `
Bireena Bakery - Bill Receipt
Bill #: ${billData.billNumber}
Customer: ${billData.customerName}
Items: ${billData.items.length}
Subtotal: ₹${billData.subtotal.toFixed(2)}
Discount: ₹${billData.discountAmount.toFixed(2)}
Total: ₹${billData.total.toFixed(2)}
Payment: ${billData.paymentMethod.toUpperCase()}

Thank you for your purchase!
        `.trim();

        const result = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedPhone
        });

        return { success: true, messageId: result.sid };
    } catch (error) {
        console.error('SMS Error:', error.message);
        return { success: false, message: error.message };
    }
};

module.exports = {
    sendBillSMS
};
