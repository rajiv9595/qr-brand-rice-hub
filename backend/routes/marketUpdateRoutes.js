const express = require('express');
const router = express.Router();
const {
    createUpdate,
    updateMarketUpdate,
    deleteMarketUpdate,
    getMarketUpdates,
} = require('../controllers/marketUpdateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route
router.get('/', getMarketUpdates);

// Protected routes (Admin or Expert only)
router.post('/', protect, authorize('admin', 'expert'), createUpdate);
router.put('/:id', protect, authorize('admin', 'expert'), updateMarketUpdate);
router.delete('/:id', protect, authorize('admin', 'expert'), deleteMarketUpdate);

module.exports = router;
