const RiceListing = require('../models/RiceListing');
const SupplierProfile = require('../models/SupplierProfile');
const Joi = require('joi');
const asyncHandler = require('../utils/asyncHandler');
const { APPROVAL_STATUS, USAGE_CATEGORIES } = require('../utils/constants');

// @desc    Create a rice listing
// @route   POST /api/rice
// @access  Private (Supplier)
exports.createListing = asyncHandler(async (req, res) => {
    // Parse specifications if it's a string (from FormData)
    if (req.body.specifications && typeof req.body.specifications === 'string') {
        try {
            req.body.specifications = JSON.parse(req.body.specifications);
        } catch (e) {
            console.error("Failed to parse specifications:", e);
        }
    }

    const schema = Joi.object({
        brandName: Joi.string().required(),
        riceVariety: Joi.string().required(),
        pricePerBag: Joi.number().min(0).required(),
        stockAvailable: Joi.number().min(0).required(),
        bagWeightKg: Joi.number().min(0).required(),
        dispatchTimeline: Joi.string().required(),
        usageCategory: Joi.string().valid(...USAGE_CATEGORIES).required(),
        specifications: Joi.object({
            grainLength: Joi.string(),
            riceAge: Joi.string(),
            purityPercentage: Joi.number().min(0).max(100),
            brokenGrainPercentage: Joi.number().min(0).max(100),
            moistureContent: Joi.number().min(0).max(100),
            cookingTime: Joi.string()
        }).optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!supplierProfile) {
        res.status(400);
        throw new Error('Please create a supplier profile first');
    }



    const listingData = {
        ...req.body,
        supplierId: supplierProfile._id,
        approvalStatus: APPROVAL_STATUS.PENDING,
        isActive: false,
        bagImageUrl: req.files && req.files['bagImage'] ? req.files['bagImage'][0].path : null,
        grainImageUrl: req.files && req.files['grainImage'] ? req.files['grainImage'][0].path : null,
    };

    const listing = await RiceListing.create(listingData);

    res.status(201).json({ success: true, data: listing });
});

// @desc    Edit a rice listing
// @route   PUT /api/rice/:id
// @access  Private (Supplier)
exports.updateListing = asyncHandler(async (req, res) => {
    // Parse specifications if it's a string (from FormData)
    if (req.body.specifications && typeof req.body.specifications === 'string') {
        try {
            req.body.specifications = JSON.parse(req.body.specifications);
        } catch (e) {
            console.error("Failed to parse specifications:", e);
        }
    }

    let listing = await RiceListing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    // Check ownership
    const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!supplierProfile || listing.supplierId.toString() !== supplierProfile._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to edit this listing');
    }

    // Handle Approved Listings (Only allow Stock Update)
    if (listing.approvalStatus === APPROVAL_STATUS.APPROVED) {
        if (req.body.stockAvailable !== undefined) {
            const allowedFields = ['stockAvailable'];
            const requestedUpdates = Object.keys(req.body);
            const hasForbiddenUpdates = requestedUpdates.some(key => !allowedFields.includes(key));

            if (hasForbiddenUpdates) {
                res.status(400);
                throw new Error('Approved listings are locked. You can only update Stock.');
            }

            listing.stockAvailable = req.body.stockAvailable;
            await listing.save();
            return res.json({ success: true, data: listing, message: 'Stock updated successfully' });
        } else {
            res.status(400);
            throw new Error('Cannot edit details of an approved listing. Only Stock can be updated.');
        }
    }

    // For Pending/Rejected: Allow full editing
    const updatedData = { ...req.body };

    // Security: Prevent suppliers from changing status directly
    delete updatedData.approvalStatus;
    delete updatedData.isActive;
    delete updatedData.rejectionReason;
    delete updatedData.supplierId;

    // Reset status to pending if it was rejected
    if (listing.approvalStatus === APPROVAL_STATUS.REJECTED) {
        updatedData.approvalStatus = APPROVAL_STATUS.PENDING;
        updatedData.isActive = false;
        updatedData.adminFeedback = "";
    }

    // Update images if provided
    if (req.files) {
        if (req.files['bagImage']) updatedData.bagImageUrl = req.files['bagImage'][0].path;
        if (req.files['grainImage']) updatedData.grainImageUrl = req.files['grainImage'][0].path;
    }

    listing = await RiceListing.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.json({ success: true, data: listing });
});

// @desc    Get supplier's own listings
// @route   GET /api/rice/my-listings
// @access  Private (Supplier)
exports.getMyListings = asyncHandler(async (req, res) => {
    const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!supplierProfile) {
        res.status(404);
        throw new Error('Supplier profile not found');
    }

    const listings = await RiceListing.find({ supplierId: supplierProfile._id });
    res.json({ success: true, data: listings });
});

// @desc    Get all active + approved listings (Public)
// @route   GET /api/rice
// @access  Public
exports.getPublicListings = asyncHandler(async (req, res) => {
    const listings = await RiceListing.find({
        approvalStatus: APPROVAL_STATUS.APPROVED,
        isActive: true,
    }).populate('supplierId', 'millName district state');

    res.json({ success: true, data: listings });
});

// @desc    Advanced search and filter rice listings
// @route   GET /api/rice/search
// @access  Public
exports.searchListings = asyncHandler(async (req, res) => {
    const {
        riceVariety,
        usageCategory,
        minPrice,
        maxPrice,
        district,
        state,
        sortBy,
        page = 1,
        limit = 20,
    } = req.query;

    let query = {
        approvalStatus: APPROVAL_STATUS.APPROVED,
        isActive: true,
    };

    if (riceVariety) query.riceVariety = { $regex: riceVariety, $options: 'i' };
    if (usageCategory) query.usageCategory = usageCategory;



    if (minPrice || maxPrice) {
        query.pricePerBag = {};
        if (minPrice) query.pricePerBag.$gte = Number(minPrice);
        if (maxPrice) query.pricePerBag.$lte = Number(maxPrice);
    }

    if (district || state) {
        let supplierQuery = {};
        if (district) supplierQuery.district = { $regex: district, $options: 'i' };
        if (state) supplierQuery.state = { $regex: state, $options: 'i' };

        const suppliers = await SupplierProfile.find(supplierQuery).select('_id');
        const supplierIds = suppliers.map((s) => s._id);

        if (supplierIds.length === 0) {
            return res.json({
                success: true,
                totalResults: 0,
                currentPage: Number(page),
                totalPages: 0,
                results: [],
            });
        }
        query.supplierId = { $in: supplierIds };
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'priceAsc') sort = { pricePerBag: 1 };
    if (sortBy === 'priceDesc') sort = { pricePerBag: -1 };
    if (sortBy === 'newest') sort = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const totalResults = await RiceListing.countDocuments(query);
    const results = await RiceListing.find(query)
        .populate('supplierId', 'millName district state')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-__v');

    res.json({
        success: true,
        totalResults,
        currentPage: Number(page),
        totalPages: Math.ceil(totalResults / Number(limit)),
        results,
    });
});

// @desc    Compare multiple rice listings
// @route   POST /api/rice/compare
// @access  Public
exports.compareListings = asyncHandler(async (req, res) => {
    const { listingIds } = req.body;

    if (!listingIds || !Array.isArray(listingIds)) {
        res.status(400);
        throw new Error('Please provide an array of listing IDs');
    }

    if (listingIds.length < 2 || listingIds.length > 3) {
        res.status(400);
        throw new Error('Comparison requires minimum 2 and maximum 3 listings');
    }

    const comparison = await RiceListing.find({
        _id: { $in: listingIds },
        approvalStatus: APPROVAL_STATUS.APPROVED,
        isActive: true,
    })
        .populate('supplierId', 'millName district state')
        .select('brandName riceVariety pricePerBag bagWeightKg usageCategory supplierId bagImageUrl averageRating ratingDetails dispatchTimeline specifications');

    const formattedComparison = comparison.map((item) => ({
        id: item._id,
        brandName: item.brandName,
        riceVariety: item.riceVariety,
        pricePerBag: item.pricePerBag,
        bagWeightKg: item.bagWeightKg,
        usageCategory: item.usageCategory,
        supplier: item.supplierId,
        bagImageUrl: item.bagImageUrl,
        averageRating: item.averageRating,
        ratingDetails: item.ratingDetails,
        dispatchTimeline: item.dispatchTimeline,
        specifications: item.specifications
    }));

    res.json({ success: true, comparison: formattedComparison });
});

// @desc    Get single listing by ID
// @route   GET /api/rice/:id
// @access  Public
exports.getListingById = asyncHandler(async (req, res) => {
    const listing = await RiceListing.findById(req.params.id)
        .populate('supplierId', 'millName district state');

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    res.json({ success: true, data: listing });
});

// @desc    Deactivate listing (Supplier)
// @route   PATCH /api/rice/:id/deactivate
// @access  Private (Supplier)
exports.deactivateListing = asyncHandler(async (req, res) => {
    const listing = await RiceListing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!supplierProfile || listing.supplierId.toString() !== supplierProfile._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to deactivate this listing');
    }

    listing.isActive = false;
    await listing.save();

    res.json({ success: true, data: listing, message: 'Listing deactivated successfully' });
});

// @desc    Activate listing (Supplier)
// @route   PATCH /api/rice/:id/activate
// @access  Private (Supplier)
exports.activateListing = asyncHandler(async (req, res) => {
    const listing = await RiceListing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!supplierProfile || listing.supplierId.toString() !== supplierProfile._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to activate this listing');
    }

    if (listing.approvalStatus !== APPROVAL_STATUS.APPROVED) {
        res.status(400);
        throw new Error('Listing must be approved to activate');
    }

    listing.isActive = true;
    await listing.save();

    res.json({ success: true, data: listing, message: 'Listing activated successfully' });
});

// @desc    Delete listing (Supplier)
// @route   DELETE /api/rice/:id
// @access  Private (Supplier)
exports.deleteListing = asyncHandler(async (req, res) => {
    const listing = await RiceListing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!supplierProfile || listing.supplierId.toString() !== supplierProfile._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this listing');
    }

    // Delete images from Cloudinary if they exist
    const { cloudinary } = require('../config/cloudinary');

    const deleteImage = async (url) => {
        if (!url || !url.includes('cloudinary.com')) return;
        try {
            const parts = url.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                const afterUpload = parts.slice(uploadIndex + 2);
                const publicId = afterUpload.join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
        }
    };

    await deleteImage(listing.bagImageUrl);
    await deleteImage(listing.grainImageUrl);

    await RiceListing.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Listing permanently removed' });
});
