const CookingTips = require('../models/CookingTips');
const RiceListing = require('../models/RiceListing');
const Joi = require('joi');

// @desc    Create cooking tips
// @route   POST /api/cooking-tips
// @access  Private (Admin/Expert)
exports.createCookingTips = async (req, res) => {
    try {
        const schema = Joi.object({
            riceListingId: Joi.string().required(),
            washingMethod: Joi.string()
                .valid('Light Wash', 'Multiple Wash', 'Soaking Required', 'No Wash Needed')
                .required(),
            soakingTimeMinutes: Joi.number().min(0),
            waterRatio: Joi.string().required(),
            cookingMethod: Joi.string()
                .valid('Pressure Cooker', 'Open Vessel', 'Electric Cooker', 'Suitable for All')
                .required(),
            expectedTexture: Joi.string().required(),
            bestDishes: Joi.array().items(Joi.string()),
            notes: Joi.string().allow('', null),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { riceListingId } = req.body;

        // Check if listing is approved
        const listing = await RiceListing.findById(riceListingId);
        if (!listing || listing.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cooking tips can only be added to approved listings',
            });
        }

        // Check for duplicate
        const existingTips = await CookingTips.findOne({ riceListingId });
        if (existingTips) {
            return res.status(400).json({
                success: false,
                message: 'This listing already has cooking tips',
            });
        }

        const tips = await CookingTips.create({
            ...req.body,
            createdBy: req.user._id,
        });

        res.status(201).json({ success: true, data: tips });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update cooking tips
// @route   PUT /api/cooking-tips/:id
// @access  Private (Admin/Expert)
exports.updateCookingTips = async (req, res) => {
    try {
        let tips = await CookingTips.findById(req.params.id);

        if (!tips) {
            return res.status(404).json({ success: false, message: 'Cooking tips not found' });
        }

        // Check permission (Admin or the expert who created it)
        if (req.user.role !== 'admin' && tips.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update these tips' });
        }

        tips = await CookingTips.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: tips });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete cooking tips
// @route   DELETE /api/cooking-tips/:id
// @access  Private (Admin/Expert)
exports.deleteCookingTips = async (req, res) => {
    try {
        const tips = await CookingTips.findById(req.params.id);

        if (!tips) {
            return res.status(404).json({ success: false, message: 'Cooking tips not found' });
        }

        // Check permission
        if (req.user.role !== 'admin' && tips.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete these tips' });
        }

        await tips.deleteOne();

        res.json({ success: true, message: 'Cooking tips removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get cooking tips by rice listing ID
// @route   GET /api/rice/:id/cooking-tips
// @access  Public
exports.getListingCookingTips = async (req, res) => {
    try {
        const tips = await CookingTips.findOne({ riceListingId: req.params.id }).populate(
            'createdBy',
            'name'
        );

        if (!tips) {
            return res.status(404).json({ success: false, message: 'No cooking tips found for this listing' });
        }

        res.json({
            success: true,
            data: {
                washingMethod: tips.washingMethod,
                soakingTimeMinutes: tips.soakingTimeMinutes,
                waterRatio: tips.waterRatio,
                cookingMethod: tips.cookingMethod,
                expectedTexture: tips.expectedTexture,
                bestDishes: tips.bestDishes,
                notes: tips.notes,
                createdBy: tips.createdBy.name,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all cooking tips (Admin)
// @route   GET /api/cooking-tips
// @access  Private (Admin/Expert)
exports.getAllCookingTips = async (req, res) => {
    try {
        const tips = await CookingTips.find()
            .populate('riceListingId', 'brandName riceVariety')
            .populate('createdBy', 'name');

        res.json({ success: true, count: tips.length, data: tips });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
