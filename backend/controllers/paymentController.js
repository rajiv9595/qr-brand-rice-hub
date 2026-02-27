const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a new payment order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const options = {
        amount: Math.round(order.totalPrice * 100), // Amount in paise
        currency: 'INR',
        receipt: `receipt_${order.orderId}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    if (!rzpOrder) {
        res.status(500);
        throw new Error('Razorpay order creation failed');
    }

    res.json({
        success: true,
        data: rzpOrder,
    });
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
    const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
        const order = await Order.findById(orderId);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: 'paid'
            };

            await order.save();
            res.json({ success: true, message: 'Payment verified and order updated' });
        } else {
            res.status(404);
            throw new Error('Order not found after payment');
        }
    } else {
        res.status(400);
        throw new Error('Invalid payment signature (Security alert!)');
    }
});
