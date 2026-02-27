const mongoose = require('mongoose');

const searchLeadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    query: {
        riceVariety: String,
        district: String,
        state: String,
        usageCategory: String
    },
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Indexing for faster heat-map aggregation
searchLeadSchema.index({ "query.district": 1, "query.riceVariety": 1 });

module.exports = mongoose.model('SearchLead', searchLeadSchema);
