const mongoose = require('mongoose');

const expertReviewSchema = new mongoose.Schema(
    {
        riceListingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RiceListing',
            required: true,
            unique: true, // Only one expert review per rice listing
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        suitabilityScore: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        grainQualityGrade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C'],
            required: true,
        },
        priceFairnessScore: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        recommendedUsage: {
            type: String,
            required: true,
        },
        finalRecommendation: {
            type: String,
            enum: ['Recommended', 'Premium Choice', 'Fair Deal', 'Not Recommended'],
            required: true,
        },
        expertNotes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ExpertReview', expertReviewSchema);
