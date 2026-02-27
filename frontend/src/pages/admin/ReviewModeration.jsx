import React, { useState, useEffect } from 'react';
import { Trash2, Flag, Star } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ReviewModeration = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllReviews({ filter });
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this review?')) return;
        try {
            await adminService.deleteReview(id);
            fetchReviews();
        } catch (err) {
            alert('Failed to delete review');
        }
    };

    const handleFlag = async (id) => {
        try {
            await adminService.flagReview(id);
            fetchReviews();
        } catch (err) {
            alert('Failed to flag review');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Review Moderation</h2>
                    <p className="text-gray-600 mt-2">Monitor and moderate customer reviews</p>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    <option value="all">All Reviews</option>
                    <option value="low">Low Ratings (≤2)</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="card p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="font-bold text-gray-900">{review.userId?.name}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.overallRating
                                                            ? 'text-gold-500 fill-gold-500'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {review.isFlagged && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                FLAGGED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Listing: <span className="font-bold">{review.listingId?.brandName}</span>
                                    </p>
                                    <p className="text-gray-700">{review.reviewText}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleFlag(review._id)}
                                        className="btn text-sm py-2 px-3 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200"
                                    >
                                        <Flag className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="btn text-sm py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-gray-500 font-medium">Grain Quality</p>
                                    <p className="font-bold text-gray-900">{review.grainQuality}/5</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Cooking</p>
                                    <p className="font-bold text-gray-900">{review.cookingResult}/5</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Taste</p>
                                    <p className="font-bold text-gray-900">{review.taste}/5</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Value</p>
                                    <p className="font-bold text-gray-900">{review.valueForMoney}/5</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewModeration;
