const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/constants');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupplierProfile',
        required: true,
        index: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RiceListing',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
        index: true
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
        razorpay_order_id: { type: String },
        razorpay_payment_id: { type: String },
        razorpay_signature: { type: String },
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    shippingAddress: {
        street: { type: String, required: true },
        village: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        phone: { type: String, required: true }
    },
    orderDate: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
