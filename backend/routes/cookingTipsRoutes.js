const express = require('express');
const router = express.Router();
const {
    createCookingTips,
    updateCookingTips,
    deleteCookingTips,
    getAllCookingTips,
} = require('../controllers/cookingTipsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protected routes (Admin or Expert only)
router.use(protect);
router.use(authorize('admin', 'expert'));


router.get('/', getAllCookingTips);
router.post('/', createCookingTips);
router.put('/:id', updateCookingTips);
router.delete('/:id', deleteCookingTips);

module.exports = router;
