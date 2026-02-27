const twilio = require('twilio');

// CONFIGURATION (In a real app, use process.env)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials exist
const client = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

console.log('--- [NotificationService] Loaded Config ---');
console.log('Account SID:', TWILIO_ACCOUNT_SID ? 'Loaded' : 'Missing');
console.log('Auth Token:', TWILIO_AUTH_TOKEN ? 'Loaded' : 'Missing');
console.log('From Phone:', TWILIO_PHONE_NUMBER);
console.log('Client Init:', !!client);
console.log('--------------------------------------------');

/**
 * Sends an SMS notification for order updates.
 * 
 * @param {string} phone - The recipient's phone number (must include country code, e.g., +91...)
 * @param {string} message - The message body
 */
const sendSMS = async (phone, message) => {
    // 1. Validate Phone
    if (!phone) {
        console.warn('NotificationService: No phone number provided');
        return;
    }

    // Ensure phone has country code
    // Remove all whitespace
    let formattedPhone = phone.replace(/\s/g, '');

    // If it's a simple 10-digit Indian number, add +91
    if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
    }
    // If it doesn't start with +, add it (assuming user provided full number without +)
    else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
    }

    console.log(`[NotificationService] Prepare to send to: '${formattedPhone}'`);

    // 2. Send Real SMS (if configured)
    if (client) {
        try {
            await client.messages.create({
                body: message,
                from: TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`[NotificationService] SMS sent to ${formattedPhone}`);
        } catch (error) {
            console.error('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.error(' [TWILIO ERROR] Failed to send SMS to', formattedPhone);
            console.error(' Error Message:', error.message);
            console.error(' Hint: If using Trial Account, is this number verified?');
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
        }
    } else {
        console.log('[NotificationService] Twilio not configured (Mock Mode).');
    }
};

const notificationService = {
    sendOrderPlaced: async (phone, orderId, amount) => {
        const msg = `QR BRAND: Your order #${orderId} for Rs.${amount} has been placed successfully. We will notify you when it is confirmed.`;
        await sendSMS(phone, msg);
    },

    sendOrderConfirmed: async (phone, orderId) => {
        const msg = `QR BRAND: Good news! Your order #${orderId} has been CONFIRMED by the supplier.`;
        await sendSMS(phone, msg);
    },

    sendOrderShipped: async (phone, orderId) => {
        const msg = `QR BRAND: Your order #${orderId} has been SHIPPED. It is on its way to you!`;
        await sendSMS(phone, msg);
    },

    sendOrderDelivered: async (phone, orderId) => {
        const msg = `QR BRAND: Order #${orderId} has been DELIVERED. Thank you for shopping with us!`;
        await sendSMS(phone, msg);
    },

    sendOrderCancelled: async (phone, orderId) => {
        const msg = `QR BRAND: Your order #${orderId} has been CANCELLED. If this was a mistake, please contact support.`;
        await sendSMS(phone, msg);
    },

    sendSMS: async (phone, message) => {
        await sendSMS(phone, message);
    }
};

module.exports = notificationService;
