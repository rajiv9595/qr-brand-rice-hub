const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RiceListing',
        required: true
    },
    targetPrice: {
        type: Number
    },
    isNotified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure a user can only watch a specific listing once
watchlistSchema.index({ userId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
