const mongoose = require('mongoose');

const riceStandardSchema = new mongoose.Schema({
    riceVariety: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    standards: {
        prime: {
            minLength: Number, // mm
            maxMoisture: Number, // %
            maxBroken: Number, // %
        },
        standard: {
            minLength: Number,
            maxMoisture: Number,
            maxBroken: Number,
        }
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('RiceStandard', riceStandardSchema);
