const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyMFA,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-mfa', verifyMFA);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
