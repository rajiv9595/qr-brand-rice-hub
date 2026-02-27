const express = require('express');
const router = express.Router();
const {
    createUpdate,
    updateMarketUpdate,
    deleteMarketUpdate,
    getMarketUpdates,
} = require('../controllers/marketUpdateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public route
router.get('/', getMarketUpdates);

// Protected routes (Admin or Expert only)
router.post('/', protect, authorize('admin', 'expert'), upload.single('image'), createUpdate);
router.put('/:id', protect, authorize('admin', 'expert'), upload.single('image'), updateMarketUpdate);
router.delete('/:id', protect, authorize('admin', 'expert'), deleteMarketUpdate);

module.exports = router;
