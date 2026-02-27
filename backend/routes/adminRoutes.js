
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllListings,
    approveListing,
    rejectListing,
    deactivateListing,
    getDashboardStats,
    getAllSuppliers,
    deactivateSupplier,
    getTopSuppliers,
    getAllUsers,
    updateUserStatus,
    getAllSupportTickets,
    updateTicketStatus,
    replyToTicket
} = require('../controllers/adminController');

const {
    getAllReviews,
    flagReview,
    deleteReview
} = require('../controllers/reviewController');

// Dashboard Stats
router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);
router.get('/dashboard/top-suppliers', protect, authorize('admin'), getTopSuppliers);

// User Management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/status', protect, authorize('admin'), updateUserStatus);

// Supplier Management
router.get('/suppliers', protect, authorize('admin'), getAllSuppliers);
router.patch('/suppliers/:id/deactivate', protect, authorize('admin'), deactivateSupplier);

// Listing Management
router.get('/listings', protect, authorize('admin'), getAllListings);
router.patch('/listings/:id/approve', protect, authorize('admin'), approveListing);
router.patch('/listings/:id/reject', protect, authorize('admin'), rejectListing);
router.patch('/listings/:id/deactivate', protect, authorize('admin'), deactivateListing);

// Support Management
router.get('/support', protect, authorize('admin'), getAllSupportTickets);
router.patch('/support/:id', protect, authorize('admin'), updateTicketStatus);
router.post('/support/:id/reply', protect, authorize('admin'), replyToTicket);

// Review Moderation
router.get('/reviews', protect, authorize('admin'), getAllReviews);
router.patch('/reviews/:id/flag', protect, authorize('admin'), flagReview);
router.delete('/reviews/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
