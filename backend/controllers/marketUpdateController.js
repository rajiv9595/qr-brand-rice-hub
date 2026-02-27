const MarketUpdate = require('../models/MarketUpdate');
const Joi = require('joi');

// @desc    Create market update
// @route   POST /api/market-updates
// @access  Private (Admin/Expert)
exports.createUpdate = async (req, res) => {
    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            category: Joi.string()
                .valid(
                    'Education',
                    'Quality',
                    'Market Trends',
                    'Price Alerts',
                    'Supply Updates'
                )
                .required(),
            district: Joi.string().allow('', null),
            state: Joi.string().allow('', null),
            priorityFlag: Joi.boolean(),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const updateData = {
            ...req.body,
            createdBy: req.user._id,
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const update = await MarketUpdate.create(updateData);

        res.status(201).json({ success: true, data: update });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update market update
// @route   PUT /api/market-updates/:id
// @access  Private (Admin/Expert)
exports.updateMarketUpdate = async (req, res) => {
    try {
        let update = await MarketUpdate.findById(req.params.id);

        if (!update) {
            return res.status(404).json({ success: false, message: 'Update not found' });
        }

        // Check permission
        if (req.user.role !== 'admin' && update.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this feed' });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        update = await MarketUpdate.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: update });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete market update
// @route   DELETE /api/market-updates/:id
// @access  Private (Admin/Expert)
exports.deleteMarketUpdate = async (req, res) => {
    try {
        const update = await MarketUpdate.findById(req.params.id);

        if (!update) {
            return res.status(404).json({ success: false, message: 'Update not found' });
        }

        // Check permission
        if (req.user.role !== 'admin' && update.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this feed' });
        }

        await update.deleteOne();

        res.json({ success: true, message: 'Market update removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all market updates with filters and pagination
// @route   GET /api/market-updates
// @access  Public
exports.getMarketUpdates = async (req, res) => {
    try {
        const { category, district, state, page = 1, limit = 10 } = req.query;

        let query = {};

        if (category) query.category = category;
        if (district) query.district = { $regex: district, $options: 'i' };
        if (state) query.state = { $regex: state, $options: 'i' };

        const skip = (Number(page) - 1) * Number(limit);

        const totalResults = await MarketUpdate.countDocuments(query);
        const updates = await MarketUpdate.find(query)
            .sort({ priorityFlag: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('createdBy', 'name');

        res.json({
            success: true,
            totalResults,
            currentPage: Number(page),
            totalPages: Math.ceil(totalResults / Number(limit)),
            updates,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
