const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createNegotiation,
    getMyNegotiations,
    getNegotiation,
    addMessage,
    acceptNegotiation,
    rejectNegotiation
} = require('../controllers/negotiationController');

// All negotiation routes require authentication
router.use(protect);

// Allow both customers and suppliers to view their negotiations
router.get('/', getMyNegotiations);
router.get('/:id', getNegotiation);

// Operations involving an existing negotiation thread
router.post('/:id/messages', addMessage);
router.put('/:id/accept', acceptNegotiation);
router.put('/:id/reject', rejectNegotiation);

// Create is only for customers typically on a listing
router.post('/', authorize('customer'), createNegotiation);

module.exports = router;
