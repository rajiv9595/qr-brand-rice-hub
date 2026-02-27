const express = require('express');
const router = express.Router();
const {
    createExpertReview,
    updateExpertReview,
    deleteExpertReview,
    getAllExpertReviews,
} = require('../controllers/expertReviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protected routes (Expert or Admin only)
router.use(protect);
router.use(authorize('expert', 'admin'));

router.get('/', getAllExpertReviews);
router.post('/', createExpertReview);
router.put('/:id', updateExpertReview);
router.delete('/:id', deleteExpertReview);

module.exports = router;
