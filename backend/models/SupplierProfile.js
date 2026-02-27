const mongoose = require('mongoose');

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
            accountNumber: { type: String, trim: true },
            bankName: { type: String, trim: true },
            ifscCode: { type: String, trim: true },
            branchName: { type: String, trim: true },
        },
        upiId: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SupplierProfile', supplierProfileSchema);
