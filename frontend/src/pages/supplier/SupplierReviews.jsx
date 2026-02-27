import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { supplierService } from '../../services';

const SupplierReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await supplierService.getReviews();
            setReviews(res.data.reviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Product Reviews</h2>
                <p className="text-gray-600 mt-2">Feedback from customers on your rice listings</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading reviews...</div>
            ) : reviews.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{review.riceListingId?.brandName}</h3>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{review.riceListingId?.riceVariety}</p>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.round((review.grainQuality + review.cookingResult + review.taste + review.valueForMoney) / 4) ? 'text-gold-500 fill-gold-500' : 'text-gray-200'}`}
                                    />
                                ))}
                                <span className="ml-2 text-sm font-bold text-gray-700">
                                    {((review.grainQuality + review.cookingResult + review.taste + review.valueForMoney) / 4).toFixed(1)}
                                </span>
                            </div>

                            <p className="text-gray-600 italic mb-4 leading-relaxed">"{review.comment}"</p>

                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                                <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded uppercase">Q: {review.grainQuality}</span>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded uppercase">C: {review.cookingResult}</span>
                                <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2 py-1 rounded uppercase">T: {review.taste}</span>
                                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded uppercase">V: {review.valueForMoney}</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-400 font-medium">
                                By {review.userId?.name || 'Customer'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
                    <p className="text-gray-500 mt-1">Wait for customers to rate your products.</p>
                </div>
            )}
        </div>
    );
};

export default SupplierReviews;
