const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Add listing to watchlist
// @route   POST /api/watchlist
exports.addToWatchlist = asyncHandler(async (req, res) => {
    const { listingId, targetPrice } = req.body;

    const watchItem = await Watchlist.create({
        userId: req.user._id,
        listingId,
        targetPrice
    });

    res.status(201).json({ success: true, data: watchItem });
});

// @desc    Get my watchlist
// @route   GET /api/watchlist
exports.getMyWatchlist = asyncHandler(async (req, res) => {
    const watchlist = await Watchlist.find({ userId: req.user._id })
        .populate('listingId', 'brandName riceVariety pricePerBag bagImageUrl stockAvailable');

    res.json({ success: true, data: watchlist });
});

// @desc    Remove from watchlist
// @route   DELETE /api/watchlist/:id
exports.removeFromWatchlist = asyncHandler(async (req, res) => {
    await Watchlist.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
    });
    res.json({ success: true, message: 'Removed from watchlist' });
});
