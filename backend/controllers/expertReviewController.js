const ExpertReview = require('../models/ExpertReview');
const RiceListing = require('../models/RiceListing');
const Joi = require('joi');

// @desc    Create expert review
// @route   POST /api/expert-review
// @access  Private (Expert/Admin)
exports.createExpertReview = async (req, res) => {
    try {
        const schema = Joi.object({
            riceListingId: Joi.string().required(),
            suitabilityScore: Joi.number().min(1).max(5).required(),
            grainQualityGrade: Joi.string().valid('A+', 'A', 'B+', 'B', 'C').required(),
            priceFairnessScore: Joi.number().min(1).max(5).required(),
            recommendedUsage: Joi.string().required(),
            finalRecommendation: Joi.string()
                .valid('Recommended', 'Premium Choice', 'Fair Deal', 'Not Recommended')
                .required(),
            expertNotes: Joi.string().allow('', null),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { riceListingId } = req.body;

        // Check if rice listing is approved
        const listing = await RiceListing.findById(riceListingId);
        if (!listing || listing.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Expert reviews can only be added to approved listings',
            });
        }

        // Check for duplicate
        const existingReview = await ExpertReview.findOne({ riceListingId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'This listing already has an expert review',
            });
        }

        const review = await ExpertReview.create({
            ...req.body,
            expertId: req.user._id,
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update expert review
// @route   PUT /api/expert-review/:id
// @access  Private (Expert/Admin)
exports.updateExpertReview = async (req, res) => {
    try {
        let review = await ExpertReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check permission (Admin or the expert who created it)
        if (req.user.role !== 'admin' && review.expertId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
        }

        review = await ExpertReview.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete expert review
// @route   DELETE /api/expert-review/:id
// @access  Private (Expert/Admin)
exports.deleteExpertReview = async (req, res) => {
    try {
        const review = await ExpertReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check permission
        if (req.user.role !== 'admin' && review.expertId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        res.json({ success: true, message: 'Expert review removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get expert review by rice listing ID
// @route   GET /api/rice/:id/expert-review
// @access  Public
exports.getListingExpertReview = async (req, res) => {
    try {
        const review = await ExpertReview.findOne({ riceListingId: req.params.id }).populate(
            'expertId',
            'name'
        );

        if (!review) {
            return res.status(200).json({ success: true, data: null });
        }

        res.json({
            success: true,
            data: {
                suitabilityScore: review.suitabilityScore,
                grainQualityGrade: review.grainQualityGrade,
                priceFairnessScore: review.priceFairnessScore,
                recommendedUsage: review.recommendedUsage,
                finalRecommendation: review.finalRecommendation,
                expertNotes: review.expertNotes,
                expertName: review.expertId.name,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all expert reviews
// @route   GET /api/expert-review
// @access  Private (Admin/Expert)
exports.getAllExpertReviews = async (req, res) => {
    try {
        const reviews = await ExpertReview.find()
            .populate('riceListingId', 'brandName riceVariety')
            .populate('expertId', 'name email')
            .sort({ createdAt: -1 });

        // Map it to add expertName to the top level if needed by the frontend frontend,
        // or the frontend can just read it from the populated expertId
        const mappedReviews = reviews.map(r => {
            const doc = r.toObject();
            return {
                ...doc,
                expertName: doc.expertId?.name || 'Unknown Expert'
            };
        });

        res.json({ success: true, reviews: mappedReviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
