const nodemailer = require('nodemailer');

// 1. Configure the Transporter
// This example uses Gmail, but standard SMTP is better for production
// 1. Configure the Transporter
// Explicitly use smtp.gmail.com on Port 587 (TLS) to avoid ETIMEDOUT
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4
});

/**
 * Sends a professional HTML email notification.
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - HTML body content
 */
const sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.EMAIL_USER || !to) {
        console.log('[EmailService] Email not configured or no recipient.');
        return;
    }

    const mailOptions = {
        from: `"QR BRAND Rice Hub" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent to ${to}`);
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error.message);
        throw error; // Rethrow so the caller knows it failed
    }
};

/**
 * Generates a professional HTML email template
 */
const createTemplate = (title, message, orderId, additionalInfo = '') => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #1a4d2e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QR BRAND</h1>
            <p style="color: #a3cfbb; margin: 5px 0 0;">Premium Rice Intelligence Hub</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0;">${title}</h2>
            <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                ${message}
            </p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1a4d2e; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #1a4d2e;">Order ID: #${orderId}</p>
                ${additionalInfo}
            </div>

            <p style="color: #555555; line-height: 1.6;">
                We are committed to delivering the finest quality rice directly from our mills to your kitchen. Thank you for choosing excellence.
            </p>

            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="display: inline-block; background-color: #1a4d2e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">View Order Details</a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
            <p>&copy; ${new Date().getFullYear()} QR Brand Rice Hub. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
    `;
};

const emailService = {
    sendOrderPlaced: async (email, orderId, customerName, amount) => {
        const subject = `Order Confirmation: #${orderId}`;
        const title = `Thank You, ${customerName}!`;
        const message = `Your order has been successfully placed. We are getting everything ready to dispatch the finest quality rice to your doorstep.`;
        const additional = `<p style="margin: 5px 0 0;">Total Amount: <strong>₹${amount}</strong></p>`;

        await sendEmail(email, subject, createTemplate(title, message, orderId, additional));
    },

    sendOrderConfirmed: async (email, orderId, customerName) => {
        const subject = `Order Confirmed: #${orderId}`;
        const title = `Great News, ${customerName}!`;
        const message = `Your order has been officially confirmed by our supplier. Your premium rice is being packed with care.`;

        await sendEmail(email, subject, createTemplate(title, message, orderId));
    },

    sendOrderShipped: async (email, orderId, customerName) => {
        const subject = `Order Shipped: #${orderId}`;
        const title = `On Its Way!`;
        const message = `Your order has been shipped and is making its way to you. Get your kitchen ready for the aroma of premium quality rice!`;

        await sendEmail(email, subject, createTemplate(title, message, orderId));
    },

    sendOrderDelivered: async (email, orderId, customerName) => {
        const subject = `Order Delivered: #${orderId}`;
        const title = `Bon Appétit, ${customerName}!`;
        const message = `Your order has been delivered successfully. We hope every grain brings you joy. We look forward to serving you again!`;

        await sendEmail(email, subject, createTemplate(title, message, orderId));
    },

    sendOrderCancelled: async (email, orderId, customerName) => {
        const subject = `Order Cancelled: #${orderId}`;
        const title = `Order Status Update`;
        const message = `Your order has been cancelled. If this was a mistake or you have any questions, please reach out to our support team immediately.`;
        const additional = `<p style="margin: 5px 0 0;">Note: If you already paid, refund will be processed in 5-7 days.</p>`;

        await sendEmail(email, subject, createTemplate(title, message, orderId, additional));
    },

    sendEmail: async (to, subject, htmlContent) => {
        await sendEmail(to, subject, htmlContent);
    },

    sendMFACode: async (email, code) => {
        const subject = 'Your Admin Portal Access Code';
        const html = `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #1a4d2e; text-align: center;">MFA Authentication</h2>
                <p>A login attempt was made to the QR BRAND Admin Portal.</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a4d2e;">${code}</span>
                </div>
                <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 10px; color: #999; text-align: center;">If you did not request this code, please change your password immediately.</p>
            </div>
        `;
        await sendEmail(email, subject, html);
    },

    sendPasswordResetEmail: async (email, resetUrl) => {
        const subject = 'QR BRAND - Password Reset Request';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1a4d2e; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QR BRAND</h1>
                    <p style="color: #a3cfbb; margin: 5px 0 0;">Password Reset</p>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #333333; margin-top: 0;">Hello,</h2>
                    <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                        You are receiving this email because a password reset request was made for your account. 
                        If you did not make this request, please ignore this email.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #1a4d2e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="color: #888888; font-size: 14px; margin-top: 20px;">
                        Or copy and paste this link into your browser:<br/>
                        <a href="${resetUrl}" style="word-break: break-all; color: #1a4d2e;">${resetUrl}</a>
                    </p>
                </div>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
                    <p>&copy; ${new Date().getFullYear()} QR Brand Rice Hub. All rights reserved.</p>
                </div>
            </div>
        `;
        await sendEmail(email, subject, html);
    }
};

module.exports = emailService;
