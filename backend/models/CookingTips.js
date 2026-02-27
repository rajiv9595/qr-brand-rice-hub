const mongoose = require('mongoose');

const cookingTipsSchema = new mongoose.Schema(
    {
        riceListingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RiceListing',
            required: true,
            unique: true, // Only one cooking guide per rice listing
        },
        washingMethod: {
            type: String,
            enum: ['Light Wash', 'Multiple Wash', 'Soaking Required', 'No Wash Needed'],
            required: true,
        },
        soakingTimeMinutes: {
            type: Number,
            default: 0,
        },
        waterRatio: {
            type: String, // Example: "1:2"
            required: true,
        },
        cookingMethod: {
            type: String,
            enum: ['Pressure Cooker', 'Open Vessel', 'Electric Cooker', 'Suitable for All'],
            required: true,
        },
        expectedTexture: {
            type: String,
            required: true,
        },
        bestDishes: [
            {
                type: String,
            },
        ],
        notes: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('CookingTips', cookingTipsSchema);
