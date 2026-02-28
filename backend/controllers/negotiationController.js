const Negotiation = require('../models/Negotiation');
const RiceListing = require('../models/RiceListing');
const SupplierProfile = require('../models/SupplierProfile');

// @desc    Initiate a negotiation (Buyer)
// @route   POST /api/negotiations
// @access  Private (Buyer)
exports.createNegotiation = async (req, res) => {
    try {
        const { listingId, initialMessage, proposedPrice, proposedQuantity } = req.body;
        const buyerId = req.user._id;

        const listing = await RiceListing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if active negotiation already exists
        const existing = await Negotiation.findOne({
            buyerId,
            listingId,
            status: { $in: ['pending', 'active'] }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have an active negotiation for this listing' });
        }

        const negotiation = await Negotiation.create({
            buyerId,
            supplierId: listing.supplierId,
            listingId,
            status: 'pending',
            currentOffer: {
                price: proposedPrice || listing.pricePerBag,
                quantity: proposedQuantity || 1,
                offeredBy: 'customer'
            },
            messages: [{
                senderId: buyerId,
                senderRole: 'customer',
                message: initialMessage,
                proposedPrice,
                proposedQuantity
            }]
        });

        // Populate details before returning
        await negotiation.populate('listingId', 'brandName riceVariety pricePerBag bagImageUrl');

        res.status(201).json({ success: true, data: negotiation });
    } catch (err) {
        console.error('Error creating negotiation:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all negotiations for logged-in user (Buyer or Supplier)
// @route   GET /api/negotiations
// @access  Private
exports.getMyNegotiations = async (req, res) => {
    try {
        let negotiations;

        if (req.user.role === 'customer') {
            negotiations = await Negotiation.find({ buyerId: req.user._id })
                .populate('listingId', 'brandName riceVariety pricePerBag bagImageUrl')
                .populate({
                    path: 'supplierId',
                    select: 'millName userId',
                    populate: {
                        path: 'userId',
                        select: 'name profilePicture'
                    }
                })
                .sort('-updatedAt');
        } else if (req.user.role === 'supplier') {
            const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
            if (!supplierProfile) {
                return res.status(404).json({ success: false, message: 'Supplier profile not found' });
            }
            negotiations = await Negotiation.find({ supplierId: supplierProfile._id })
                .populate('listingId', 'brandName riceVariety pricePerBag bagImageUrl')
                .populate('buyerId', 'name email phone profilePicture')
                .sort('-updatedAt');
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized get negotiations' });
        }

        res.status(200).json({ success: true, data: negotiations });
    } catch (err) {
        console.error('Error getting negotiations:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single negotiation by ID
// @route   GET /api/negotiations/:id
// @access  Private
exports.getNegotiation = async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id)
            .populate('listingId', 'brandName riceVariety pricePerBag bagImageUrl')
            .populate('buyerId', 'name email profilePicture')
            .populate({
                path: 'supplierId',
                select: 'millName userId',
                populate: {
                    path: 'userId',
                    select: 'name profilePicture'
                }
            });

        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        // Check ownership
        if (req.user.role === 'customer' && negotiation.buyerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (req.user.role === 'supplier' && negotiation.supplierId.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: negotiation });
    } catch (err) {
        console.error('Error getting negotiation:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add message / counter-offer to a negotiation
// @route   POST /api/negotiations/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
    try {
        const { message, proposedPrice, proposedQuantity } = req.body;

        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        const isSupplier = req.user.role === 'supplier';

        // Validation check for permissions could be strictly written here...

        const newMessage = {
            senderId: req.user._id,
            senderRole: req.user.role,
            message,
        };

        if (proposedPrice || proposedQuantity) {
            newMessage.proposedPrice = proposedPrice || negotiation.currentOffer.price;
            newMessage.proposedQuantity = proposedQuantity || negotiation.currentOffer.quantity;

            // Update the current global offer on the negotiation thread
            negotiation.currentOffer = {
                price: newMessage.proposedPrice,
                quantity: newMessage.proposedQuantity,
                offeredBy: isSupplier ? 'supplier' : 'customer'
            };

            negotiation.status = 'active'; // Once counter-offered, it becomes active
        }

        negotiation.messages.push(newMessage);
        await negotiation.save();

        res.status(200).json({ success: true, data: negotiation });
    } catch (err) {
        console.error('Error adding message:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Accept Negotiation
// @route   PUT /api/negotiations/:id/accept
// @access  Private
exports.acceptNegotiation = async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        if (negotiation.status === 'accepted' || negotiation.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Negotiation already finalized' });
        }

        // E.g., if supplier offered, customer accepts it, or vice versa
        // Let's just blindly accept for now given prototype scope
        negotiation.status = 'accepted';

        // Pushing a final system/status message (optional)
        negotiation.messages.push({
            senderId: req.user._id,
            senderRole: req.user.role,
            message: "OFFER ACCEPTED",
        });

        await negotiation.save();

        res.status(200).json({ success: true, data: negotiation });

        // Note: From here, the frontend can let the Buyer "Checkout" using this accepted offer.
    } catch (err) {
        console.error('Error accepting negotiation:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reject Negotiation
// @route   PUT /api/negotiations/:id/reject
// @access  Private
exports.rejectNegotiation = async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }

        negotiation.status = 'rejected';

        negotiation.messages.push({
            senderId: req.user._id,
            senderRole: req.user.role,
            message: "OFFER REJECTED",
        });

        await negotiation.save();

        res.status(200).json({ success: true, data: negotiation });
    } catch (err) {
        console.error('Error rejecting negotiation:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
