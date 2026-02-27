const mongoose = require('mongoose');
const { APPROVAL_STATUS, USAGE_CATEGORIES } = require('../utils/constants');

const riceListingSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SupplierProfile',
            required: true,
            index: true,
        },
        brandName: {
            type: String,
            required: [true, 'Please add a brand name'],
            trim: true,
            index: true,
        },
        riceVariety: {
            type: String,
            required: [true, 'Please add a rice variety'],
            trim: true,
            index: true,
        },
        pricePerBag: {
            type: Number,
            required: [true, 'Please add a price per bag'],
            min: 0,
            index: true,
        },
        stockAvailable: {
            type: Number,
            default: 0,
            min: 0,
        },
        bagWeightKg: {
            type: Number,
            min: 0,
        },
        dispatchTimeline: {
            type: String,
        },
        usageCategory: {
            type: String,
            enum: USAGE_CATEGORIES,
            required: true,
            index: true,
        },
        bagImageUrl: {
            type: String,
        },
        grainImageUrl: {
            type: String,
        },
        approvalStatus: {
            type: String,
            enum: Object.values(APPROVAL_STATUS),
            default: APPROVAL_STATUS.PENDING,
            index: true,
        },
        rejectionReason: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        ratingDetails: {
            grainQualityAvg: { type: Number, default: 0 },
            cookingResultAvg: { type: Number, default: 0 },
            tasteAvg: { type: Number, default: 0 },
            valueForMoneyAvg: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient searching
riceListingSchema.index({ approvalStatus: 1, isActive: 1 });

module.exports = mongoose.model('RiceListing', riceListingSchema);
