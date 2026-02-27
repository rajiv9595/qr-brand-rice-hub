const mongoose = require('mongoose');

const marketUpdateSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        category: {
            type: String,
            enum: [
                'Trend Update',
                'Price Movement',
                'Supply Alert',
                'Quality Awareness',
                'Usage Guidance',
            ],
            required: [true, 'Please add a category'],
            index: true,
        },
        district: {
            type: String,
            index: true,
        },
        state: {
            type: String,
            index: true,
        },
        priorityFlag: {
            type: Boolean,
            default: false,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for sorting
marketUpdateSchema.index({ priorityFlag: -1, createdAt: -1 });

module.exports = mongoose.model('MarketUpdate', marketUpdateSchema);
