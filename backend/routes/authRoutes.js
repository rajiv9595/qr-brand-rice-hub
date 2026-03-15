const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyMFA,
    getProfile,
    updateProfile,
    deleteAccount,
    forgotPassword,
    resetPassword,
    googleAuth,
    sendOtp,
    verifyOtp,
    refreshToken,
    logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-mfa', verifyMFA);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile)
    .delete(protect, deleteAccount);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;
