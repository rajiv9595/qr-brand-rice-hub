const Review = require('../models/Review');
const RiceListing = require('../models/RiceListing');
const SupplierProfile = require('../models/SupplierProfile');
const Joi = require('joi');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
exports.submitReview = async (req, res) => {
    try {
        const schema = Joi.object({
            riceListingId: Joi.string().required(),
            grainQuality: Joi.number().min(1).max(5).required(),
            cookingResult: Joi.number().min(1).max(5).required(),
            taste: Joi.number().min(1).max(5).required(),
            valueForMoney: Joi.number().min(1).max(5).required(),
            comment: Joi.string().max(500).allow('', null),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { riceListingId } = req.body;

        // Check if listing exists and is approved
        const listing = await RiceListing.findById(riceListingId);
        if (!listing || listing.approvalStatus !== 'approved') {
            return res.status(404).json({ success: false, message: 'Valid approved listing not found' });
        }

        // Check for duplicate review
        const existingReview = await Review.findOne({
            userId: req.user._id,
            riceListingId,
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            userId: req.user._id,
            ...req.body,
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure review belongs to user
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        // Manually trigger average recalculation
        await Review.getAverageRating(review.riceListingId);

        res.json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure review belongs to user or user is admin
        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        const riceListingId = review.riceListingId;
        await review.deleteOne();

        // Recalculate averages
        await Review.getAverageRating(riceListingId);

        res.json({ success: true, message: 'Review removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get ratings for a listing
// @route   GET /api/rice/:id/ratings
// @access  Public
exports.getListingRatings = async (req, res) => {
    try {
        const listing = await RiceListing.findById(req.params.id).select(
            'averageRating numReviews ratingDetails'
        );

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({
            success: true,
            data: {
                overallRating: listing.averageRating,
                totalReviews: listing.numReviews,
                ...listing.ratingDetails ? listing.ratingDetails.toObject() : {},
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin)
exports.getAllReviews = async (req, res) => {
    try {
        const { filter } = req.query;
        let query = {};

        if (filter === 'flagged') {
            query.isFlagged = true;
        } else if (filter === 'low') {
            // Check if any rating component is low (<= 2)
            query.$or = [
                { grainQuality: { $lte: 2 } },
                { cookingResult: { $lte: 2 } },
                { taste: { $lte: 2 } },
                { valueForMoney: { $lte: 2 } }
            ];
        }

        const reviews = await Review.find(query)
            .populate('userId', 'name')
            .populate('riceListingId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Flag a review
// @route   PATCH /api/reviews/:id/flag
// @access  Private (Admin)
exports.flagReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.isFlagged = !review.isFlagged;
        await review.save();

        res.json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get reviews for logged in supplier
// @route   GET /api/supplier/reviews
// @access  Private (Supplier)
exports.getSupplierReviews = async (req, res) => {
    try {
        const supplier = await SupplierProfile.findOne({ userId: req.user._id });

        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier profile not found' });
        }

        const listings = await RiceListing.find({ supplierId: supplier._id }).select('_id');
        const listingIds = listings.map(l => l._id);

        const reviews = await Review.find({ riceListingId: { $in: listingIds } })
            .populate('userId', 'name')
            .populate('riceListingId', 'brandName riceVariety')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all reviews for a specific listing
// @route   GET /api/rice/:id/reviews
// @access  Public
exports.getListingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ riceListingId: req.params.id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
