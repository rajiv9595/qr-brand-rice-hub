const RiceListing = require('../models/RiceListing');
const SearchLead = require('../models/SearchLead');
const SupplierProfile = require('../models/SupplierProfile');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Market Benchmarking for a Supplier
// @route   GET /api/supplier/insights/benchmarking
exports.getSupplierBenchmarking = asyncHandler(async (req, res) => {
    const profile = await SupplierProfile.findOne({ userId: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Supplier profile not found');
    }

    // 1. Get all active listings for this supplier
    const myListings = await RiceListing.find({
        supplierId: profile._id,
        approvalStatus: 'approved',
        isActive: true
    });

    const benchmarking = await Promise.all(myListings.map(async (listing) => {
        // Find average price for this variety in the SAME district
        const stats = await RiceListing.aggregate([
            {
                $match: {
                    riceVariety: listing.riceVariety,
                    approvalStatus: 'approved',
                    isActive: true
                }
            },
            {
                // Join with supplier profile to get district
                $lookup: {
                    from: 'supplierprofiles',
                    localField: 'supplierId',
                    foreignField: '_id',
                    as: 'supplier'
                }
            },
            { $unwind: '$supplier' },
            {
                $match: {
                    'supplier.district': profile.district
                }
            },
            {
                $group: {
                    _id: '$riceVariety',
                    avgPrice: { $avg: '$pricePerBag' },
                    minPrice: { $min: '$pricePerBag' },
                    maxPrice: { $max: '$pricePerBag' },
                    listingCount: { $count: {} }
                }
            }
        ]);

        const marketStats = stats[0] || null;

        return {
            listingId: listing._id,
            brandName: listing.brandName,
            variety: listing.riceVariety,
            myPrice: listing.pricePerBag,
            marketAvg: marketStats ? Math.round(marketStats.avgPrice) : listing.pricePerBag,
            marketMin: marketStats ? marketStats.minPrice : listing.pricePerBag,
            marketMax: marketStats ? marketStats.maxPrice : listing.pricePerBag,
            competitorCount: marketStats ? marketStats.listingCount - 1 : 0,
            status: marketStats ? (listing.pricePerBag > marketStats.avgPrice ? 'above' : 'competitive') : 'unique'
        };
    }));

    res.json({ success: true, data: benchmarking });
});

// @desc    Get Demand Heatmap (Admin)
// @route   GET /api/admin/insights/heatmap
exports.getDemandHeatmap = asyncHandler(async (req, res) => {
    const heatmap = await SearchLead.aggregate([
        {
            $group: {
                _id: {
                    district: '$query.district',
                    variety: '$query.riceVariety'
                },
                searchCount: { $count: {} }
            }
        },
        { $sort: { searchCount: -1 } },
        { $limit: 20 },
        {
            $project: {
                district: '$_id.district',
                variety: '$_id.variety',
                searchCount: 1,
                _id: 0
            }
        }
    ]);

    res.json({ success: true, data: heatmap });
});

// @desc    Track Search Lead (Public/Buyer)
exports.trackSearch = asyncHandler(async (req, res, next) => {
    // This will be called as middleware in search routes
    if (req.query.riceVariety || req.query.district) {
        SearchLead.create({
            userId: req.user?._id,
            query: {
                riceVariety: req.query.riceVariety,
                district: req.query.district,
                state: req.query.state,
                usageCategory: req.query.usageCategory
            },
            ipAddress: req.ip
        }).catch(err => console.error('Failed to log search lead:', err));
    }
    next();
});
