const SupplierProfile = require('../models/SupplierProfile');
const User = require('../models/User');
const Joi = require('joi');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES, TRADER_TYPES } = require('../utils/constants');
const { syncSupplierTrust } = require('../utils/trustScoreGenerator');

// @desc    Create or update supplier profile
// @route   POST /api/supplier/profile
// @access  Private (Supplier)
exports.upsertProfile = asyncHandler(async (req, res) => {
    // Normalize bankDetails for multipart/form-data / string formats
    if (req.body.bankDetails === '') {
        req.body.bankDetails = null;
    }

    if (req.body.bankDetails && typeof req.body.bankDetails === 'string') {
        try {
            req.body.bankDetails = JSON.parse(req.body.bankDetails);
        } catch (e) {
            // Failed to parse: treat it as absent so schema validation doesn't fail
            req.body.bankDetails = null;
        }
    }

    const schema = Joi.object({
        millName: Joi.string().required(),
        traderType: Joi.string().valid(...Object.values(TRADER_TYPES)).optional(),
        gstNumber: Joi.string().allow('', null),
        gstRegistrationYears: Joi.number().min(0).allow(null),
        address: Joi.string().required(),
        district: Joi.string().required(),
        state: Joi.string().required(),
        phone: Joi.string().allow('', null),
        bankDetails: Joi.object({
            accountHolderName: Joi.string().allow('', null),
            accountNumber: Joi.string().allow('', null),
            bankName: Joi.string().allow('', null),
            ifscCode: Joi.string().allow('', null),
            branchName: Joi.string().allow('', null),
        }).allow(null),
        upiId: Joi.string().allow('', null),
        lat: Joi.number().min(-90).max(90).allow(null),
        lng: Joi.number().min(-180).max(180).allow(null)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const profileFields = {
        userId: req.user._id,
        ...req.body,
    };

    // Handle shop photo if uploaded
    if (req.files && req.files['shopPhoto']) {
        profileFields.shopPhotoUrl = req.files['shopPhoto'][0].path;
    }

    // Make sure we correctly map lat and lng to location GeoJSON
    if (req.body.lat !== undefined && req.body.lng !== undefined && req.body.lat !== null && req.body.lng !== null) {
        profileFields.location = {
            type: 'Point',
            coordinates: [Number(req.body.lng), Number(req.body.lat)]
        };
    }
    delete profileFields.lat;
    delete profileFields.lng;

    if (req.body.gstRegistrationYears !== undefined) {
        const years = Number(req.body.gstRegistrationYears);
        if (years >= 10) {
            // Auto-activation logic after 2 minutes
            await User.findByIdAndUpdate(req.user._id, {
                isVerified: false,
                autoActivateAt: new Date(Date.now() + 2 * 60 * 1000)
            });

            // Immediate non-persistent schedule (fallback for current process)
            setTimeout(async () => {
                try {
                    await User.findByIdAndUpdate(req.user._id, {
                        isVerified: true,
                        autoActivateAt: null
                    });
                } catch (e) {
                    console.error('Auto-activation failed:', e);
                }
            }, 2 * 60 * 1000);

        } else {
            // Manual approval required (< 10 years)
            await User.findByIdAndUpdate(req.user._id, {
                isVerified: false,
                autoActivateAt: null
            });
        }
    }

    let profile = await SupplierProfile.findOne({ userId: req.user._id });

    if (profile) {
        profile = await SupplierProfile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: profileFields },
            { new: true }
        );
        if (req.body.phone) {
            await User.findByIdAndUpdate(req.user._id, { phone: req.body.phone });
        }

        // Add trust sync calculation after updating
        profile = await syncSupplierTrust(profile);

        return res.json({ success: true, data: profile });
    }

    if (req.body.phone) {
        await User.findByIdAndUpdate(req.user._id, { phone: req.body.phone });
    }

    profile = await SupplierProfile.create(profileFields);

    // Calculate initial trust properties
    profile = await syncSupplierTrust(profile);

    res.status(201).json({ success: true, data: profile });
});

// @desc    Get current supplier profile
// @route   GET /api/supplier/profile
// @access  Private (Supplier/Admin)
exports.getProfile = asyncHandler(async (req, res) => {
    let userData = await User.findById(req.user._id);

    // Lazy Auto-Activation Check
    if (userData && !userData.isVerified && userData.autoActivateAt && new Date() >= new Date(userData.autoActivateAt)) {
        userData.isVerified = true;
        userData.autoActivateAt = null;
        await userData.save();
    }

    let profile = await SupplierProfile.findOne({ userId: req.user._id })
        .populate('userId', 'name email phone isVerified role autoActivateAt');

    if (!profile) {
        res.status(404);
        throw new Error('Supplier profile not found');
    }

    // Force sync the latest trust indicators
    profile = await syncSupplierTrust(profile);

    res.json({ success: true, data: profile });
});
