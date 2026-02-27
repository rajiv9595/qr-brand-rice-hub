const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        riceListingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RiceListing',
            required: true,
        },
        grainQuality: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        cookingResult: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        taste: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        valueForMoney: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        isFlagged: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from submitting more than one review per rice listing
reviewSchema.index({ userId: 1, riceListingId: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (riceListingId) {
    const obj = await this.aggregate([
        {
            $match: { riceListingId: riceListingId },
        },
        {
            $group: {
                _id: '$riceListingId',
                averageRating: {
                    $avg: {
                        $divide: [
                            { $add: ['$grainQuality', '$cookingResult', '$taste', '$valueForMoney'] },
                            4,
                        ],
                    },
                },
                grainQualityAvg: { $avg: '$grainQuality' },
                cookingResultAvg: { $avg: '$cookingResult' },
                tasteAvg: { $avg: '$taste' },
                valueForMoneyAvg: { $avg: '$valueForMoney' },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        if (obj.length > 0) {
            await mongoose.model('RiceListing').findByIdAndUpdate(riceListingId, {
                averageRating: obj[0].averageRating.toFixed(1),
                numReviews: obj[0].numReviews,
                ratingDetails: {
                    grainQualityAvg: obj[0].grainQualityAvg.toFixed(1),
                    cookingResultAvg: obj[0].cookingResultAvg.toFixed(1),
                    tasteAvg: obj[0].tasteAvg.toFixed(1),
                    valueForMoneyAvg: obj[0].valueForMoneyAvg.toFixed(1),
                },
            });
        } else {
            await mongoose.model('RiceListing').findByIdAndUpdate(riceListingId, {
                averageRating: 0,
                numReviews: 0,
                ratingDetails: {
                    grainQualityAvg: 0,
                    cookingResultAvg: 0,
                    tasteAvg: 0,
                    valueForMoneyAvg: 0,
                },
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.riceListingId);
});

// Call getAverageRating before remove
reviewSchema.post('remove', function () {
    this.constructor.getAverageRating(this.riceListingId);
});

module.exports = mongoose.model('Review', reviewSchema);
