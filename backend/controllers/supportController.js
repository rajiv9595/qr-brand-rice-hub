
const SupportTicket = require('../models/SupportTicket');

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Please provide subject and message' });
        }

        const ticket = await SupportTicket.create({
            user: req.user._id,
            subject,
            message,
            priority: priority || 'medium',
            messages: [{
                sender: 'user',
                text: message
            }]
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get user's support tickets
// @route   GET /api/support/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add a message to a ticket
// @route   POST /api/support/:id/message
// @access  Private
exports.addTicketMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Check ownership
        if (ticket.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        ticket.messages.push({
            sender: 'user',
            text
        });

        // Re-open if closed/resolved
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
            ticket.status = 'open';
        }

        await ticket.save();
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
