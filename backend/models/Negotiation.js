const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['customer', 'supplier'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // Optional offer details embedded in a message
    proposedPrice: Number,
    proposedQuantity: Number,
}, { timestamps: true });

const negotiationSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupplierProfile',
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RiceListing',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    currentOffer: {
        price: Number,
        quantity: Number,
        offeredBy: {
            type: String, // 'customer' or 'supplier'
        }
    },
    messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Negotiation', negotiationSchema);
