const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyMFA,
    getProfile,
    updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-mfa', verifyMFA);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

module.exports = router;
