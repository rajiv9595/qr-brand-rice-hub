const Order = require('../models/Order');
const RiceListing = require('../models/RiceListing');
const SupplierProfile = require('../models/SupplierProfile');
const Counter = require('../models/Counter'); // Added Counter model for unique IDs

const notificationService = require('../utils/notificationService');
const emailService = require('../utils/emailService');

// @desc    Create a new order
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
    try {
        const { listingId, quantity, shippingAddress } = req.body;
        const buyer = req.user; // Captured from middleware

        // 1. Fetch listing to verify stock and calculate price
        const listing = await RiceListing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Rice listing not found' });
        }

        // 2. Atomic Stock Check and Update
        // This ensures that even if two requests come at the same time, stock won't go negative.
        const updatedListing = await RiceListing.findOneAndUpdate(
            { _id: listingId, stockAvailable: { $gte: quantity } },
            { $inc: { stockAvailable: -quantity } },
            { new: true }
        );

        if (!updatedListing) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient stock or listing changed. Available: ${listing.stockAvailable} bags.` 
            });
        }

        // 3. Calculate total price
        const totalPrice = listing.pricePerBag * quantity;

        // 3a. Generate Robust Running Order ID using Counter collection
        let orderId;
        try {
            const counter = await Counter.findOneAndUpdate(
                { id: 'orderId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            
            // If it's a new counter, start from 1001 as previously established
            if (counter.seq < 1001) {
                counter.seq = 1001;
                await counter.save();
            }
            
            orderId = `ORD-${counter.seq}`;
        } catch (idErr) {
            console.error('Order ID Gen Error:', idErr);
            // Fallback to timestamp if counter fails to ensure order creation doesn't break
            orderId = `ORD-${Date.now().toString().slice(-6)}`;
        }

        // 3b. Validate Required Fields (Early check to avoid DB error)
        if (!shippingAddress || !shippingAddress.phone) {
            return res.status(400).json({ success: false, message: 'Shipping phone number is required' });
        }

        // 4. Create Order
        const order = new Order({
            buyerId: buyer._id,
            supplierId: listing.supplierId,
            listingId,
            quantity,
            totalPrice,
            shippingAddress,
            status: 'Pending',
            orderId
        });

        // 5. Save Order
        await order.save();

        // 6. Send Notification (Async/Fire-and-Forget to prevent lag)
        console.log('[OrderController] Processing Notification for Order:', order.orderId);
        console.log('[OrderController] Shipping Phone:', shippingAddress?.phone);

        // SMS (Non-blocking)
        if (shippingAddress && shippingAddress.phone) {
            notificationService.sendOrderPlaced(shippingAddress.phone, order.orderId, totalPrice)
                .catch(err => console.error("Failed to send SMS (Async):", err.message));
        } else {
            console.warn('[OrderController] No phone number found in shipping address!');
        }

        // Email (Non-blocking)
        const buyerEmail = shippingAddress?.email || (buyer ? buyer.email : null);
        console.log('[OrderController] Checking email for buyer:', buyerEmail || 'No Email Found');

        if (buyerEmail) {
            console.log(`[OrderController] Initiating async email to ${buyerEmail}...`);
            emailService.sendOrderPlaced(buyerEmail, order.orderId, buyer.name, totalPrice)
                .then(() => console.log(`[OrderController] Email sent successfully (Async).`))
                .catch(err => console.error("[OrderController] Failed to send Email (Async):", err.message));
        } else {
            console.warn('[OrderController] Skipping email: No email address found for buyer.');
        }

        // 7c. Inventory Alert for Supplier
        if (listing.stockAvailable < 10) {
            // Find supplier's phone (need to populate supplierId user)
            const supplierWithUser = await SupplierProfile.findById(listing.supplierId).populate('userId', 'phone');
            if (supplierWithUser && supplierWithUser.userId?.phone) {
                console.log(`[OrderController] Sending Stock Alert to Supplier... Current Stock: ${listing.stockAvailable}`);
                notificationService.sendStockAlert(supplierWithUser.userId.phone, listing.brandName, listing.stockAvailable)
                    .catch(err => console.error("Failed to send Stock Alert SMS:", err.message));
            }
        }

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        console.error('Order Creation Error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error processing order',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc    Get orders for Buyer (Purchase History)
// @access  Private (Buyer)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id })
            .populate('listingId', 'brandName riceVariety bagImageUrl')
            .populate({
                path: 'supplierId',
                select: 'millName userId',
                populate: {
                    path: 'userId',
                    select: 'phone email'
                }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get incoming orders for Supplier
// @access  Private (Supplier)
exports.getSupplierOrders = async (req, res) => {
    try {
        // Find SupplierProfile for current user
        const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
        if (!supplierProfile) {
            return res.status(404).json({ success: false, message: 'Supplier profile not found' });
        }

        const orders = await Order.find({ supplierId: supplierProfile._id })
            .populate('buyerId', 'name email phone')
            .populate('listingId', 'brandName riceVariety pricePerBag bagImageUrl')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update Order Status (Accept/Deliver/Cancel)
// @access  Private (Supplier)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
        const orderId = req.params.id;

        const order = await Order.findById(orderId).populate('buyerId', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify ownership (Supplier)
        const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
        if (!supplierProfile || order.supplierId.toString() !== supplierProfile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to manage this order' });
        }
        // Prevent redundant status updates and duplicate emails
        if (order.status === status) {
            return res.json({ success: true, data: order, message: 'Status is already ' + status });
        }

        // If cancelling, restore stock atomically
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            await RiceListing.findByIdAndUpdate(order.listingId, {
                $inc: { stockAvailable: order.quantity }
            });
        }

        order.status = status;
        await order.save();

        // Send Status Update Notification (Async/Fire-and-Forget)
        console.log('[OrderController] Updating Status for Order:', order.orderId, '=>', status);
        console.log('[OrderController] Target Phone:', order.shippingAddress?.phone);
        const buyer = order.buyerId;

        // SMS (Non-blocking)
        if (order.shippingAddress && order.shippingAddress.phone) {
            const phone = order.shippingAddress.phone;
            const notificationPromise = (async () => {
                switch (status) {
                    case 'Confirmed': await notificationService.sendOrderConfirmed(phone, order.orderId || order._id); break;
                    case 'Shipped': await notificationService.sendOrderShipped(phone, order.orderId || order._id); break;
                    case 'Delivered': await notificationService.sendOrderDelivered(phone, order.orderId || order._id); break;
                    case 'Cancelled': await notificationService.sendOrderCancelled(phone, order.orderId || order._id); break;
                }
            })();
            notificationPromise.catch(err => console.error("Failed to send SMS (Async):", err.message));
        }

        // Email (Non-blocking)
        if (buyer && buyer.email) {
            const emailPromise = (async () => {
                switch (status) {
                    case 'Confirmed': await emailService.sendOrderConfirmed(buyer.email, order.orderId, buyer.name); break;
                    case 'Shipped': await emailService.sendOrderShipped(buyer.email, order.orderId, buyer.name); break;
                    case 'Delivered': await emailService.sendOrderDelivered(buyer.email, order.orderId, buyer.name); break;
                    case 'Cancelled': await emailService.sendOrderCancelled(buyer.email, order.orderId, buyer.name); break;
                }
            })();
            emailPromise
                .then(() => console.log(`[OrderController] Status Email sent to ${buyer.email} (Async)`))
                .catch(err => console.error("Failed to send Email (Async):", err.message));
        }

        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Admin Order Analytics
// @access  Private (Admin)
exports.getAdminOrderStats = async (req, res) => {
    try {
        // Aggregate total sales, total orders, etc.
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPrice" },
                    totalOrders: { $count: {} },
                    avgOrderValue: { $avg: "$totalPrice" }
                }
            }
        ]);

        res.json({ success: true, data: stats[0] || { totalSales: 0, totalOrders: 0, avgOrderValue: 0 } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
