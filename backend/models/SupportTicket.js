
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    messages: [{
        sender: {
            type: String, // 'user' or 'admin'
            required: true
        },
        text: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
