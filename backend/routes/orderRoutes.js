const express = require('express');
const { createOrder, getMyOrders, getSupplierOrders, updateOrderStatus, getAdminOrderStats } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Buyer Routes
// @route   POST /api/orders
// @desc    Create a new order (Customer only)
router.post('/', authorize('customer'), createOrder);

// @route   GET /api/orders/my-orders
// @desc    Get all orders placed by the current user (Customer only)
router.get('/my-orders', authorize('customer'), getMyOrders);

// Supplier Routes
// @route   GET /api/orders/supplier-orders
// @desc    Get all orders received by the supplier (Supplier only)
router.get('/supplier-orders', authorize('supplier'), getSupplierOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Supplier only)
router.put('/:id/status', authorize('supplier'), updateOrderStatus);

// Admin Routes
// @route   GET /api/orders/admin/stats
// @desc    Get order analytics (Admin only)
router.get('/admin/stats', authorize('admin'), getAdminOrderStats);

module.exports = router;
