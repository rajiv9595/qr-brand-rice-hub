const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: { type: String, default: 'QR Brand Rice Hub' },
    siteDescription: { type: String, default: 'Premium Rice Intelligence Platform' },
    maintenanceMode: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
