const express = require('express');
const router = express.Router();
const { upsertProfile, getProfile } = require('../controllers/supplierController');
const { getSupplierReviews } = require('../controllers/reviewController');
const { getSupplierBenchmarking } = require('../controllers/insightsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { upload } = require('../config/cloudinary');

router.use(protect);
router.use(authorize('supplier'));

router.post(
    '/profile',
    upload.fields([{ name: 'shopPhoto', maxCount: 1 }]),
    upsertProfile
);
router.get('/profile', getProfile);
router.get('/reviews', getSupplierReviews);
router.get('/insights/benchmarking', getSupplierBenchmarking);

module.exports = router;
