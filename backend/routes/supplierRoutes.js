const express = require('express');
const router = express.Router();
const { upsertProfile, getProfile } = require('../controllers/supplierController');
const { getSupplierReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('supplier'));

router.post('/profile', upsertProfile);
router.get('/profile', getProfile);
router.get('/reviews', getSupplierReviews);

module.exports = router;
