const express = require('express');
const router = express.Router();
const { addToWatchlist, getMyWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addToWatchlist);
router.get('/', getMyWatchlist);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
