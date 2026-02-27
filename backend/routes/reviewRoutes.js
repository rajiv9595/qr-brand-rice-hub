const express = require('express');
const router = express.Router();
const {
    submitReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', submitReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
