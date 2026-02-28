const mongoose = require('mongoose');
const Order = require('../models/Order');
const RiceListing = require('../models/RiceListing');

// Calculate and sync supplier trust score & badges
const syncSupplierTrust = async (supplierProfile) => {
    try {
        let score = 0;
        let badges = [];

        // 1. Bank Details Check (20 pts)
        if (supplierProfile.bankDetails?.accountNumber) {
            score += 20;
            // Provide a basic verified badge
            badges.push({
                title: 'Bank Verified',
                icon: 'ShieldCheck',
                color: 'text-blue-500 bg-blue-100 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
                description: 'Supplier identity linked to verified bank.'
            });
        }

        // 2. GST Check (20 pts)
        if (supplierProfile.gstNumber) {
            score += 20;
            badges.push({
                title: 'GST Verified',
                icon: 'FileCheck',
                color: 'text-purple-500 bg-purple-100 border-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
                description: 'Registered Business with valid GST.'
            });
        }

        // 3. Orders Metric (Max 30 pts)
        const totalOrders = await Order.countDocuments({
            'orderItems.listingId': {
                $in: await RiceListing.find({ supplierId: supplierProfile._id }).distinct('_id')
            },
            status: { $in: ['Delivered', 'Completed'] }
        });

        const orderScore = Math.min(totalOrders * 2, 30);
        score += orderScore;

        // 4. Reviews Metric (Max 30 pts)
        // Let's get average rating directly from the Supplier's listings aggregated
        const listings = await RiceListing.find({ supplierId: supplierProfile._id });
        let totalAvg = 0, ratedCount = 0;
        listings.forEach(l => {
            if (l.averageRating > 0) {
                totalAvg += l.averageRating;
                ratedCount++;
            }
        });

        const overallRating = ratedCount > 0 ? (totalAvg / ratedCount) : 0;
        const reviewScore = (overallRating / 5) * 30;
        score += Math.round(reviewScore);

        // Advanced Badges (The 'WOW' Badges)
        if (totalOrders >= 5 && overallRating >= 4.5) {
            badges.push({
                title: 'Top Rated Mill',
                icon: 'Award',
                color: 'text-yellow-600 bg-yellow-100 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.8)] ring-1 ring-yellow-400',
                description: 'Consistently provides 5-star quality and service.'
            });
        } else if (overallRating >= 4.0 && totalOrders >= 1) {
            badges.push({
                title: 'Premium Quality',
                icon: 'Star',
                color: 'text-orange-500 bg-orange-100 border-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.6)]',
                description: 'Highly rated by recent buyers.'
            });
        }

        if (totalOrders > 10) {
            badges.push({
                title: 'High Volume Seller',
                icon: 'TrendingUp',
                color: 'text-emerald-600 bg-emerald-100 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
                description: 'Successfully shipped many bulk orders.'
            });
        }

        supplierProfile.trustScore = score;
        supplierProfile.badges = badges;
        supplierProfile.metrics = {
            totalSuccessfulOrders: totalOrders,
            averageRating: overallRating,
            totalReviews: ratedCount
        };

        await supplierProfile.save();
        return supplierProfile;

    } catch (err) {
        console.error('Error in syncSupplierTrust:', err);
        return supplierProfile;
    }
};

module.exports = { syncSupplierTrust };
