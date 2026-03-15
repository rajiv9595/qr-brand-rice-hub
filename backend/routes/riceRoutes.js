const express = require('express');
const router = express.Router();
const {
    createListing,
    updateListing,
    getMyListings,
    getPublicListings,
    searchListings,
    compareListings,
    getListingById,
    activateListing,
    deactivateListing,
    deleteListing,
    getBestDeals,
} = require('../controllers/riceController');
const { getListingRatings, getListingReviews } = require('../controllers/reviewController');
const { getListingExpertReview } = require('../controllers/expertReviewController');
const { getListingCookingTips } = require('../controllers/cookingTipsController');
const { trackSearch } = require('../controllers/insightsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// ============================================================
// STATIC NAMED ROUTES FIRST (before any /:id param routes)
// This prevents Express from treating "best-deals" as an ObjectId
// ============================================================
router.get('/best-deals', getBestDeals);
router.get('/search', trackSearch, searchListings);
router.get('/my-listings', protect, authorize('supplier'), getMyListings);
router.post('/compare', compareListings);

// Public listing (all approved)
router.get('/', trackSearch, getPublicListings);

// Protected routes (Supplier) - Create / Update
router.post(
    '/',
    protect,
    authorize('supplier'),
    upload.fields([
        { name: 'bagImage', maxCount: 1 },
        { name: 'grainImage', maxCount: 1 },
        { name: 'cookedRiceImage', maxCount: 1 },
    ]),
    createListing
);

router.put(
    '/:id',
    protect,
    authorize('supplier'),
    upload.fields([
        { name: 'bagImage', maxCount: 1 },
        { name: 'grainImage', maxCount: 1 },
        { name: 'cookedRiceImage', maxCount: 1 },
    ]),
    updateListing
);

// ============================================================
// PARAMETERIZED /:id ROUTES LAST
// ============================================================
router.get('/:id/ratings', getListingRatings);
router.get('/:id/reviews', getListingReviews);
router.get('/:id/expert-review', getListingExpertReview);
router.get('/:id/cooking-tips', getListingCookingTips);
router.get('/:id', getListingById);
router.patch('/:id/activate', protect, authorize('supplier'), activateListing);
router.patch('/:id/deactivate', protect, authorize('supplier'), deactivateListing);
router.delete('/:id', protect, authorize('supplier'), deleteListing);

module.exports = router;
