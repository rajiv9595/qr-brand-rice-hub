import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Star, MapPin, Tag, Box, Info,
    ChefHat, Award, ShoppingBag, ShieldCheck, Sparkles,
    ArrowLeft, MessageSquare, ChevronRight,
    TrendingDown, TrendingUp, Search, X, Phone,
    Pencil, Mail
} from 'lucide-react';
import { riceService, reviewService, expertService, cookingService } from '../services';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import RiceCard from '../components/RiceCard';
import ProfessionalAddressSearch from '../components/common/ProfessionalAddressSearch';
import { optimizeImage } from '../utils/imageOptimizer';

const RiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rice, setRice] = useState(null);
    const [expertReview, setExpertReview] = useState(null);
    const [cookingTips, setCookingTips] = useState(null);
    const [ratings, setRatings] = useState(null);
    const [reviews, setReviews] = useState(null); // Add reviews state
    const [loading, setLoading] = useState(true);

    // Order State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [orderQuantity, setOrderQuantity] = useState(1);

    const [user, setUser] = useState(authService.getCurrentUser());
    const hasProfileAddress = !!(user?.address?.street && user?.address?.city);
    const [isUsingSavedAddress, setIsUsingSavedAddress] = useState(hasProfileAddress);

    const [address, setAddress] = useState({
        street: user?.address?.street || '',
        village: user?.address?.village || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        phone: user?.phone || '',
        email: user?.email || ''
    });
    const [orderLoading, setOrderLoading] = useState(false);
    const [calculatorPeople, setCalculatorPeople] = useState(2);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [relatedRice, setRelatedRice] = useState([]);
    const [reviewForm, setReviewForm] = useState({
        grainQuality: 5,
        cookingResult: 5,
        taste: 5,
        valueForMoney: 5,
        comment: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [riceRes, expertRes, cookingRes, ratingsRes, reviewsRes] = await Promise.allSettled([
                    riceService.getRiceById(id),
                    expertService.getListingExpertReview(id),
                    cookingService.getListingCookingTips(id),
                    reviewService.getListingRatings(id),
                    reviewService.getListingReviews(id) // Fetch reviews
                ]);

                if (riceRes.status === 'fulfilled') {
                    const riceData = riceRes.value.data.data;
                    setRice(riceData);
                    // Fetch related
                    const related = await riceService.getPublicListings({
                        usageCategory: riceData.usageCategory,
                        limit: 5
                    });
                    setRelatedRice(related.data.data.filter(r => (r._id || r.id) !== id).slice(0, 4));
                }
                if (expertRes.status === 'fulfilled') setExpertReview(expertRes.value.data.data);
                if (cookingRes.status === 'fulfilled') setCookingTips(cookingRes.value.data.data);
                if (ratingsRes.status === 'fulfilled') setRatings(ratingsRes.value.data.data);
                if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data.reviews);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBuyNow = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsOrderModalOpen(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewService.submitReview({
                listingId: id,
                ...reviewForm
            });
            alert('Thank you for your review!');
            setIsReviewModalOpen(false);
            // Refresh reviews
            const revRes = await reviewService.getListingReviews(id);
            setReviews(revRes.data.reviews);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        setOrderLoading(true);
        try {
            if (!orderQuantity || orderQuantity < 1) {
                alert('Please enter a valid quantity');
                setOrderLoading(false);
                return;
            }
            if (!address.phone || address.phone.length < 10) {
                alert('Please provide a valid 10-digit phone number for delivery');
                setOrderLoading(false);
                return;
            }
            await orderService.createOrder({
                listingId: rice._id,
                quantity: parseInt(orderQuantity),
                shippingAddress: address
            });
            alert('Order Placed Successfully!');
            setIsOrderModalOpen(false);
            // Refresh stock
            const res = await riceService.getRiceById(id);
            setRice(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Order Failed');
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Wait a moment, gathering details...</div>;
    if (!rice) return <div className="p-8 text-center">Listing not found.</div>;

    const isOutOfStock = rice.stockAvailable < 1;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-500">
            <Link to="/search" className="inline-flex items-center text-gray-500 hover:text-field-600 font-bold mb-4 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to listings
            </Link>

            {/* Compact Header Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Main Product Card */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-50">
                        {/* Image Section - Compact */}
                        <div className="bg-rice-50 p-8 lg:p-12 flex items-center justify-center relative min-h-[350px] lg:min-h-[450px]">
                            <div className="aspect-[4/5] w-full max-w-[280px] flex items-center justify-center relative">
                                <img
                                    src={optimizeImage(rice.bagImageUrl, 800) || 'https://via.placeholder.com/600x600?text=Rice+Brand'}
                                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-700"
                                    alt={rice.brandName}
                                />
                            </div>
                            {isOutOfStock && (
                                <div className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Sold Out
                                </div>
                            )}
                            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-gray-200">
                                <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                                <span className="text-xs font-black text-gray-800">{ratings?.overallRating || 'New'}</span>
                            </div>
                        </div>

                        {/* Details Section - Compact */}
                        <div className="p-8 lg:p-10 flex flex-col justify-center bg-white space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-field-600 bg-field-50 px-2.5 py-1.5 rounded-lg border border-field-100">{rice.usageCategory}</span>
                                    <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${isOutOfStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
                                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                    </span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-400 text-gray-900 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Mill-to-Plate Purity
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-display font-black text-gray-900 leading-tight mb-1">{rice.brandName}</h1>
                                    <p className="text-lg font-medium text-gray-400 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-field-500" /> {rice.riceVariety}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 border-b border-gray-100 pb-6">
                                <span className="text-4xl lg:text-5xl font-black text-field-700 tracking-tight">₹{rice.pricePerBag}</span>
                                <span className="text-sm font-bold text-gray-400">/ {rice.bagWeightKg}kg Bag</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mill Location</span>
                                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2 line-clamp-1">
                                        <MapPin className="w-3.5 h-3.5 text-field-500" /> {rice.supplierId.district}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dispatch Check</span>
                                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <Box className="w-3.5 h-3.5 text-field-500" /> {rice.dispatchTimeline}
                                    </p>
                                </div>
                            </div>

                            {/* Large Action Button */}
                            {user?.role !== 'supplier' && (
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isOutOfStock}
                                    className={`w-full bg-field-700 hover:bg-field-800 text-white py-4 rounded-2xl shadow-xl shadow-field-200 transition-all flex items-center justify-center gap-3 text-lg font-bold ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>{isOutOfStock ? 'Currently Unavailable' : 'Order Now'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Details Sidebar - PARALLEL */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Expert Review Card */}
                    {expertReview ? (
                        <div className="bg-field-900 text-white rounded-[2rem] p-6 relative overflow-hidden flex flex-col border border-field-800 shadow-2xl">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <Award className="w-4 h-4 text-gold-500" /> Quality Verdict
                                    </h2>
                                    <span className="bg-white/10 px-2.5 py-1 rounded-full text-gold-500 font-black text-[10px] border border-white/10">
                                        Grade {expertReview.grainQualityGrade}
                                    </span>
                                </div>

                                <p className="text-base font-bold text-gold-50 mb-6 leading-snug italic">"{expertReview.finalRecommendation}"</p>

                                {/* Quality Scorecard Section */}
                                <div className="space-y-4 mb-6">
                                    <h3 className="text-[10px] font-black text-gold-400 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">Quality Scorecard</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { label: 'Grain Strength', val: expertReview.suitabilityScore, color: 'bg-gold-500' },
                                            { label: 'Aroma & Ageing', val: expertReview.grainQualityGrade === 'A+' ? 5 : 4.5, color: 'bg-orange-400' },
                                            { label: 'Cooking Texture', val: expertReview.suitabilityScore > 4 ? 4.8 : 4.2, color: 'bg-blue-400' }
                                        ].map((metric, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                                    <span>{metric.label}</span>
                                                    <span className="text-gold-100">{metric.val}/5</span>
                                                </div>
                                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${metric.color}`} style={{ width: `${(metric.val / 5) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                            <span>Overall Market Purity</span>
                                            <span>{expertReview.priceFairnessScore}/5</span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(expertReview.priceFairnessScore / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] text-field-200 line-clamp-1 italic">"{expertReview.expertNotes}"</span>
                                    <span className="text-[9px] uppercase font-bold text-field-400 shrink-0 ml-2">By {expertReview.expertName}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-6 flex flex-col items-center justify-center text-center space-y-2 border border-gray-200 shadow-xl shadow-gray-200/40 group hover:border-field-200 transition-colors">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                <Info className="w-5 h-5 text-gray-300 group-hover:text-field-400 transition-colors" />
                            </div>
                            <span className="font-bold text-gray-400 text-xs">Expert Review Pending</span>
                        </div>
                    )}

                    {/* Cooking Tips Card */}
                    {cookingTips && (
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-xl shadow-gray-200/40 flex flex-col">
                            <h2 className="text-sm font-black uppercase text-gray-900 tracking-tight flex items-center gap-2 mb-4">
                                <ChefHat className="w-4 h-4 text-field-600" /> Cooking Guide
                            </h2>

                            <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Water Ratio</span>
                                    <span className="text-sm font-black text-gray-800">{cookingTips.waterRatio}</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Soak Time</span>
                                    <span className="text-sm font-black text-gray-800">{cookingTips.soakingTimeMinutes} min</span>
                                </div>
                            </div>

                            {/* Cooking Success Assistant - Calculator */}
                            <div className="bg-primary-50/30 p-4 rounded-2xl border border-primary-100/50 mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Cooking Success Assistant</h3>
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={calculatorPeople}
                                        onChange={(e) => setCalculatorPeople(parseInt(e.target.value))}
                                        className="flex-1 h-1 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                    <span className="text-xs font-black text-primary-700 min-w-[50px]">{calculatorPeople} People</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Raw Rice</p>
                                        <p className="text-xs font-black text-gray-800">{calculatorPeople * 0.5} Cups</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Water Needed</p>
                                        <p className="text-xs font-black text-primary-600">{(calculatorPeople * 0.5 * (parseFloat(cookingTips.waterRatio.split(':')[1]) || 2)).toFixed(1)} Cups</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase ml-1">Perfect For</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {cookingTips.bestDishes.map((dish, i) => (
                                        <span key={i} className="bg-field-50 px-2 py-1 rounded-lg text-[10px] font-bold text-field-700 capitalize border border-field-200">
                                            {dish}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Community Ratings - Now in Sidebar */}
                    {ratings && (
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-xl shadow-gray-200/40">
                            <h2 className="text-sm font-black uppercase text-gray-900 tracking-tight flex items-center gap-2 mb-4">
                                <MessageSquare className="w-4 h-4 text-field-600" /> Community Score
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Quality", val: ratings.grainQualityAvg, color: "bg-green-500" },
                                    { label: "Cooking", val: ratings.cookingResultAvg, color: "bg-blue-500" },
                                    { label: "Taste", val: ratings.tasteAvg, color: "bg-orange-500" },
                                    { label: "Value", val: ratings.valueForMoneyAvg, color: "bg-purple-500" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">{stat.label}</span>
                                            <span className="text-xs font-black text-gray-900">{stat.val}</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${(stat.val / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
                    {user && user.role === 'customer' && (
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="bg-primary-50 text-primary-600 px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest border border-primary-100 hover:bg-primary-100 transition-colors"
                        >
                            Rate Quality
                        </button>
                    )}
                </div>

                {reviews && reviews.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{review.userId?.name || 'Anonymous'}</p>
                                        <div className="flex text-gold-500 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < Math.round((review.grainQuality + review.cookingResult + review.taste + review.valueForMoney) / 4) ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 italic leading-relaxed">"{review.comment}"</p>
                                {/* Rating Breakdown on Hover (Tooltip concept) */}
                                <div className="mt-3 flex gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                    <span>Q: {review.grainQuality}</span>
                                    <span>C: {review.cookingResult}</span>
                                    <span>T: {review.taste}</span>
                                    <span>V: {review.valueForMoney}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                    </div>
                )}
            </div>

            {/* Related Products Section */}
            {relatedRice.length > 0 && (
                <div className="pt-10 pb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">More in {rice.usageCategory}</h2>
                            <p className="text-gray-400 text-sm font-medium">Similar quality rice varieties you might like</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedRice.map((item) => (
                            <div key={item._id || item.id} className="min-w-[280px]">
                                <RiceCard rice={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Form Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900">Rate Quality</h2>
                            <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {['grainQuality', 'cookingResult', 'taste', 'valueForMoney'].map((field) => (
                                    <div key={field}>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{field.replace(/([A-Z])/g, ' $1')}</label>
                                        <select
                                            value={reviewForm[field]}
                                            onChange={(e) => setReviewForm({ ...reviewForm, [field]: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Comment</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium min-h-[100px] outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Tell others about the grain quality, cooking softness, and taste..."
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary-200">
                                Submit Quality Rating
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-6 backdrop-blur-md transition-all">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-black/10 animate-in fade-in zoom-in duration-300 max-h-[85vh] flex flex-col overflow-hidden border border-white">
                        <div className="p-7 pb-0 mb-2">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 leading-tight">Place Order</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fast & Secure Delivery</p>
                                </div>
                                <button
                                    onClick={() => setIsOrderModalOpen(false)}
                                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-7 pb-7 space-y-5 custom-scrollbar">
                            <form onSubmit={submitOrder} className="space-y-5">
                                {/* Quantity Section */}
                                <div className="bg-primary-50/20 p-4 rounded-3xl border border-primary-100/50">
                                    <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest block mb-2">Quantity (Bags)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            min="1"
                                            max={rice.stockAvailable}
                                            value={orderQuantity}
                                            onChange={(e) => setOrderQuantity(e.target.value)}
                                            className="w-full text-xl font-black text-gray-900 bg-transparent outline-none border-b-2 border-primary-200 focus:border-primary-500 transition-colors py-1"
                                            required
                                        />
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-bold text-primary-300 uppercase">Total Price</p>
                                            <p className="text-xl font-black text-primary-600">₹{(rice.pricePerBag * (parseInt(orderQuantity) || 0)).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-primary-600" /> Shipping Details
                                    </h3>
                                    {hasProfileAddress && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsUsingSavedAddress(!isUsingSavedAddress);
                                                if (isUsingSavedAddress) {
                                                    // If switching TO new address, clear fields
                                                    setAddress({ street: '', village: '', city: '', state: '', zipCode: '', phone: user?.phone || '', email: user?.email || '' });
                                                } else {
                                                    // If switching BACK to saved
                                                    setAddress({
                                                        street: user.address.street,
                                                        village: user.address.village,
                                                        city: user.address.city,
                                                        state: user.address.state,
                                                        zipCode: user.address.zipCode,
                                                        phone: user.phone,
                                                        email: user.email
                                                    });
                                                }
                                            }}
                                            className="text-[10px] font-black text-primary-600 uppercase tracking-widest border border-primary-200 px-3 py-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                        >
                                            {isUsingSavedAddress ? '+ New Address' : 'Use Saved Address'}
                                        </button>
                                    )}
                                </div>

                                {isUsingSavedAddress ? (
                                    <div className="bg-primary-50/30 p-5 rounded-3xl border border-primary-100/50 space-y-1 relative group">
                                        <div className="absolute top-4 right-5 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsUsingSavedAddress(false)}
                                                className="p-1.5 bg-white text-gray-400 hover:text-primary-600 rounded-full border border-gray-100 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                title="Edit this address"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <div className="bg-primary-500 text-white p-1 rounded-full"><ShieldCheck className="w-3 h-3" /></div>
                                        </div>
                                        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-2">Delivery to saved address</p>
                                        <p className="font-bold text-gray-900 text-sm leading-relaxed">{user.address.street}</p>
                                        <p className="text-gray-500 text-xs font-medium">
                                            {user.address.village && user.address.village + ', '}
                                            {user.address.city}, {user.address.state} - {user.address.zipCode}
                                        </p>
                                        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-primary-100/50">
                                            <div className="space-y-1 flex-1 min-w-[120px]">
                                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest ml-1">Confirm Phone</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 w-3 h-3 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={address.phone}
                                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-primary-100 rounded-lg text-[10px] font-bold text-gray-700 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                                        placeholder="Confirm phone..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1 flex-1 min-w-[150px]">
                                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest ml-1">Confirm Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 w-3 h-3 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={address.email}
                                                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-primary-100 rounded-lg text-[10px] font-bold text-gray-700 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                                        placeholder="Confirm email..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {/* Dynamic Location Search */}
                                        <div className="space-y-4">
                                            {/* Professional Search Component */}
                                            <ProfessionalAddressSearch
                                                onSelect={(s) => {
                                                    setAddress(prev => ({
                                                        ...prev,
                                                        village: s.village || '',
                                                        city: s.city || prev.city,
                                                        state: s.state || prev.state,
                                                        zipCode: s.pincode || prev.zipCode || ''
                                                    }));
                                                }}
                                                initialValue={address.village}
                                            />
                                        </div>

                                        {/* Auto-filled Preview */}
                                        <div className="grid grid-cols-2 gap-3 bg-primary-50/30 p-4 rounded-2xl border border-primary-100/50 relative">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest">State</label>
                                                <input
                                                    type="text"
                                                    value={address.state}
                                                    className="w-full bg-white border border-primary-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                                                    placeholder="Auto-filled State"
                                                    readOnly
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Village / Area</label>
                                                <input
                                                    type="text"
                                                    value={address.village}
                                                    readOnly
                                                    className="w-full bg-white border border-primary-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                                                    placeholder="Selected Village"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest">City / District</label>
                                                <input
                                                    type="text"
                                                    value={address.city}
                                                    className="w-full bg-white border border-primary-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                                                    placeholder="Auto-filled City"
                                                    readOnly
                                                />
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Pincode (Zip Code)</label>
                                                <input
                                                    type="text"
                                                    value={address.zipCode}
                                                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                                    className="w-full bg-white border border-primary-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                                                    placeholder="Enter Pincode if not auto-filled"
                                                />
                                            </div>
                                        </div>

                                        {/* Specific Address */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complete Address Details</label>
                                            <textarea
                                                placeholder="Door No, Building Name, Street, Landmark..."
                                                value={address.street}
                                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                                className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none font-medium min-h-[100px] text-sm transition-all"
                                                required
                                            />
                                            <p className="text-[10px] text-gray-500 italic mt-1 pl-1">Ex: D.No 4-55, Main Road, Near Ramalayam Temple</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-gray-400 font-bold text-xs">+91</span>
                                                    <input
                                                        type="tel"
                                                        pattern="[0-9]{10}"
                                                        placeholder="9876543210"
                                                        value={address.phone.replace('+91', '')}
                                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none font-bold text-gray-900 tracking-wider text-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email for Updates</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={address.email}
                                                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none font-bold text-gray-900 text-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={orderLoading}
                                    className="w-full btn-primary py-4 rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 group mt-4"
                                >
                                    {orderLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Confirm Order <span className="opacity-60 text-xs normal-case ml-1">(₹{(rice.pricePerBag * (parseInt(orderQuantity) || 0)).toLocaleString()})</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiceDetailPage;
