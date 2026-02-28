const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const supplierProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        millName: {
            type: String,
            required: [true, 'Please add a mill name'],
            index: true,
        },
        gstNumber: {
            type: String,
        },
        address: {
            type: String,
        },
        district: {
            type: String,
            required: true,
            index: true,
        },
        state: {
            type: String,
            required: true,
            index: true,
        },
        gstRegistrationYears: {
            type: Number,
            default: 0,
        },
        bankDetails: {
            accountHolderName: { type: String, trim: true },
            accountNumber: {
                type: String,
                trim: true,
                set: encrypt,
                get: decrypt
            },
            bankName: { type: String, trim: true },
            ifscCode: { type: String, trim: true },
            branchName: { type: String, trim: true },
        },
        upiId: {
            type: String,
            trim: true,
            set: encrypt,
            get: decrypt
        },
        badges: [{
            title: String,
            icon: String, // e.g. "Zap", "Award"
            color: String,
            description: String,
            awardedAt: { type: Date, default: Date.now }
        }],
        trustScore: {
            type: Number,
            default: 0
        },
        metrics: {
            totalSuccessfulOrders: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0 },
            totalReviews: { type: Number, default: 0 }
        }
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

module.exports = mongoose.model('SupplierProfile', supplierProfileSchema);
