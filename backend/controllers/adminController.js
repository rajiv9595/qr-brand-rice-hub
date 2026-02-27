const RiceListing = require('../models/RiceListing');
const User = require('../models/User');
const SupplierProfile = require('../models/SupplierProfile');

// @desc    Get all rice listings with filters (Admin)
// @route   GET /api/admin/listings
// @access  Private (Admin)
exports.getAllListings = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        // Filter by status tab
        if (status) {
            if (status === 'deactivated') {
                query.isActive = false;
            } else {
                query.approvalStatus = status;
                // For other statuses, default to active unless specified otherwise?
                // Actually, rejected are inactive by default. Approved are active.
                // Pending are technically inactive until approved?
                // Mongoose default is isActive: true?
                // Let's just filter by approvalStatus.
                // But for 'approved', we usually mean 'active & approved'.
                if (status === 'approved') {
                    query.isActive = true;
                }
            }
        }

        // Search by brand name
        if (search) {
            query.brandName = { $regex: search, $options: 'i' };
        }

        const listings = await RiceListing.find(query)
            .populate('supplierId', 'millName gstNumber address district state')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: listings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Approve a rice listing
// @route   PATCH /api/admin/rice/:id/approve
// @access  Private (Admin)
exports.approveListing = async (req, res) => {
    try {
        const listing = await RiceListing.findByIdAndUpdate(
            req.params.id,
            {
                approvalStatus: 'approved',
                isActive: true,
            },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing, message: 'Listing approved and published' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reject a rice listing
// @route   PATCH /api/admin/rice/:id/reject
// @access  Private (Admin)
exports.rejectListing = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ success: false, message: 'Please provide a rejection reason' });
        }

        const listing = await RiceListing.findByIdAndUpdate(
            req.params.id,
            {
                approvalStatus: 'rejected',
                isActive: false,
                rejectionReason: reason,
            },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing, message: 'Listing rejected' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Deactivate a listing
// @route   PATCH /api/admin/rice/:id/deactivate
// @access  Private (Admin)
exports.deactivateListing = async (req, res) => {
    try {
        const listing = await RiceListing.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing, message: 'Listing deactivated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalSuppliers = await SupplierProfile.countDocuments();
        const totalListings = await RiceListing.countDocuments();
        const pendingListings = await RiceListing.countDocuments({ approvalStatus: 'pending' });

        // Mock reviews for now (or implement if Review model exists)
        const totalReviews = 0;
        const expertReviews = 0;

        res.json({
            success: true,
            data: {
                totalSuppliers,
                totalListings,
                pendingListings,
                totalReviews,
                expertReviews
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get All Suppliers
// @route   GET /api/admin/suppliers
// @access  Private (Admin)
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await SupplierProfile.find()
            .populate('userId', 'name email phone role isVerified createdAt')
            .sort({ createdAt: -1 });

        const suppliersWithCounts = await Promise.all(suppliers.map(async (supplier) => {
            const listingCount = await RiceListing.countDocuments({ supplierId: supplier._id });
            return {
                ...supplier.toObject(),
                listingCount
            };
        }));

        res.json({ success: true, data: suppliersWithCounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Deactivate Supplier
// @route   PATCH /api/admin/suppliers/:id/deactivate
// @access  Private (Admin)
exports.deactivateSupplier = async (req, res) => {
    try {
        // Deactivate by ID logic (Toggle verify or add active field?)
        // For now, toggle user verification status
        // ID passed is likely SupplierProfile ID or User ID?
        // AdminService usually passes ID from the row.
        // Assuming SupplierProfile ID.

        const profile = await SupplierProfile.findById(req.params.id);
        if (!profile) return res.status(404).json({ success: false, message: 'Supplier profile not found' });

        const user = await User.findById(profile.userId);
        if (user) {
            user.isVerified = !user.isVerified; // Toggle
            await user.save();
        }

        res.json({ success: true, message: 'Supplier status updated', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Top Performing Suppliers
// @route   GET /api/admin/dashboard/top-suppliers
// @access  Private (Admin)
exports.getTopSuppliers = async (req, res) => {
    const Order = require('../models/Order');
    const SupplierProfile = require('../models/SupplierProfile');

    try {
        const pipeline = [
            {
                $group: {
                    _id: "$supplierId",
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ];

        const aggregated = await Order.aggregate(pipeline);

        // Populate details manually or via lookup
        const topSuppliers = await Promise.all(aggregated.map(async (item) => {
            const supplier = await SupplierProfile.findById(item._id);
            return {
                id: item._id,
                name: supplier ? supplier.millName : 'Unknown',
                district: supplier ? supplier.district : 'N/A',
                revenue: item.totalRevenue,
                orders: item.totalOrders,
                growth: 0 // calculate growth if historical data available
            };
        }));

        res.json({ success: true, data: topSuppliers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get All Users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        let query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update User Status (block/unblock)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Logic to update status field if exists, or use existing fields
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Mock status field for now as it's not in schema
        user.status = status;
        user.isActive = status === 'active';
        await user.save();

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get All Support Tickets
// @route   GET /api/admin/support
// @access  Private (Admin)
exports.getAllSupportTickets = async (req, res) => {
    const SupportTicket = require('../models/SupportTicket');
    try {
        const { status, search } = req.query;
        let query = {};

        if (status && status !== 'all') query.status = status;
        if (search) {
            query.subject = { $regex: search, $options: 'i' };
        }

        const tickets = await SupportTicket.find(query)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update Support Ticket Status
// @route   PATCH /api/admin/support/:id
// @access  Private (Admin)
exports.updateTicketStatus = async (req, res) => {
    const SupportTicket = require('../models/SupportTicket');
    try {
        const { status } = req.body;
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reply to Support Ticket
// @route   POST /api/admin/support/:id/reply
// @access  Private (Admin)
exports.replyToTicket = async (req, res) => {
    const SupportTicket = require('../models/SupportTicket');
    try {
        const { text } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        ticket.messages.push({
            sender: 'admin',
            text,
            time: new Date()
        });

        if (ticket.status === 'open') ticket.status = 'in-progress';

        await ticket.save();
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
