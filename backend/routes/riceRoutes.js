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
} = require('../controllers/riceController');
const { getListingRatings, getListingReviews } = require('../controllers/reviewController');
const { getListingExpertReview } = require('../controllers/expertReviewController');
const { getListingCookingTips } = require('../controllers/cookingTipsController');
const { trackSearch } = require('../controllers/insightsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', trackSearch, getPublicListings);
router.get('/search', trackSearch, searchListings);
router.post('/compare', compareListings);
router.get('/:id/ratings', getListingRatings);
router.get('/:id/reviews', getListingReviews);
router.get('/:id/expert-review', getListingExpertReview);
router.get('/:id/cooking-tips', getListingCookingTips);

// Protected routes (Supplier)
router.post(
    '/',
    protect,
    authorize('supplier'),
    upload.fields([
        { name: 'bagImage', maxCount: 1 },
        { name: 'grainImage', maxCount: 1 },
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
    ]),
    updateListing
);

router.get('/my-listings', protect, authorize('supplier'), getMyListings);
router.get('/:id', getListingById);
router.patch('/:id/activate', protect, authorize('supplier'), activateListing);
router.patch('/:id/deactivate', protect, authorize('supplier'), deactivateListing);
router.delete('/:id', protect, authorize('supplier'), deleteListing);

module.exports = router;
