import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services';
import { Package, Truck, CheckCircle, XCircle, Search, Filter, ShoppingBag, Star, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewForm, setReviewForm] = useState({
        grainQuality: 5,
        cookingResult: 5,
        taste: 5,
        valueForMoney: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getMyOrders();
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (order) => {
        setSelectedOrder(order);
        setReviewForm({
            grainQuality: 5,
            cookingResult: 5,
            taste: 5,
            valueForMoney: 5,
            comment: ''
        });
        setIsReviewOpen(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await reviewService.submitReview({
                riceListingId: selectedOrder.listingId._id,
                ...reviewForm
            });
            alert('Review Submitted Successfully!');
            setIsReviewOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Confirmed: 'bg-blue-100 text-blue-800',
            Shipped: 'bg-indigo-100 text-indigo-800',
            Delivered: 'bg-green-100 text-green-800',
            Cancelled: 'bg-red-100 text-red-800'
        };
        const icons = {
            Pending: <Package className="w-3 h-3" />,
            Confirmed: <CheckCircle className="w-3 h-3" />,
            Shipped: <Truck className="w-3 h-3" />,
            Delivered: <CheckCircle className="w-3 h-3" />,
            Cancelled: <XCircle className="w-3 h-3" />
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`}>
                {icons[status]} {status}
            </span>
        );
    };

    const StarRating = ({ label, value, onChange }) => (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-600 uppercase">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`focus:outline-none transition-transform hover:scale-110 ${star <= value ? 'text-gold-500' : 'text-gray-300'}`}
                    >
                        <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-400 font-bold">Checking orders...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Purchase History</h1>
                    <p className="text-gray-500">Track and manage your orders.</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="card p-12 text-center text-gray-400 bg-gray-50/50 border-dashed border-2">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg text-gray-500">No purchases found.</p>
                    <Link to="/search" className="btn-primary mt-4 inline-flex items-center gap-2">
                        Browse Listings <Package className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="card p-6 hover:shadow-lg transition-all border border-gray-100 group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image / Thumbnail */}
                                <div className="w-full md:w-32 aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-inner border border-gray-100 shrink-0">
                                    <img
                                        src={order.listingId?.bagImageUrl || `https://placehold.co/150x150?text=Rice`}
                                        alt={order.listingId?.brandName || 'Product'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/150x150?text=No+Image';
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-primary-600">
                                                Order #{order.orderId || order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 mb-1">{order.listingId?.brandName}</h3>
                                        <p className="text-sm font-medium text-gray-500 mb-2">{order.listingId?.riceVariety} • {order.quantity} Bags</p>
                                        <div className="text-xl font-black text-gray-900">₹{order.totalPrice}</div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <StatusBadge status={order.status} />
                                        <div className="text-xs text-gray-400 font-medium">
                                            Sold by <span className="text-gray-600 font-bold">{order.supplierId?.millName || 'Unknown Mill'}</span>
                                        </div>
                                    </div>

                                    {/* Tracking Progress Bar */}
                                    {order.status !== 'Cancelled' && (
                                        <div className="mt-6">
                                            <div className="flex justify-between mb-2">
                                                {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                                    const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
                                                    const currentIdx = statuses.indexOf(order.status);
                                                    const isCompleted = idx <= currentIdx;
                                                    const isActive = idx === currentIdx;

                                                    return (
                                                        <div key={step} className="flex flex-col items-center flex-1 relative">
                                                            {/* Line Connector */}
                                                            {idx > 0 && (
                                                                <div className={`absolute top-2.5 -left-1/2 w-full h-0.5 -z-10 ${idx <= currentIdx ? 'bg-primary-500' : 'bg-gray-200'}`} />
                                                            )}
                                                            <div className={`w-5 h-5 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-primary-500 border-primary-200' : 'bg-white border-gray-100'
                                                                } ${isActive ? 'scale-125 shadow-lg shadow-primary-200 animate-pulse' : ''}`}>
                                                                {isCompleted && idx < currentIdx && <CheckCircle className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className={`text-[9px] mt-1.5 font-black uppercase tracking-widest ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-600' : 'text-gray-300'
                                                                }`}>
                                                                {step}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Supplier Contact for Queries */}
                                    <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary-600 border border-primary-50">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Supplier Contact</p>
                                                <p className="text-xs font-bold text-gray-700">{order.supplierId?.userId?.phone || 'Contact not listed'}</p>
                                            </div>
                                        </div>
                                        {order.supplierId?.userId?.phone && (
                                            <a
                                                href={`tel:+91${order.supplierId.userId.phone}`}
                                                className="px-3 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
                                            >
                                                Call Now
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 flex flex-col justify-center gap-3 md:w-48 shrink-0">
                                    <Link to={`/rice/${order.listingId?._id}`} className="w-full btn-secondary text-xs py-2 text-center text-gray-600 hover:text-primary-600">
                                        View Product
                                    </Link>
                                    {order.status === 'Delivered' && (
                                        <button
                                            onClick={() => openReviewModal(order)}
                                            className="w-full btn-primary text-xs py-2 text-center shadow-lg shadow-primary-500/20"
                                        >
                                            Write Review
                                        </button>
                                    )}
                                    {order.status === 'Cancelled' && (
                                        <div className="text-[10px] text-red-500 text-center font-bold uppercase tracking-wider bg-red-50 py-2 rounded-lg">
                                            Cancelled
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {isReviewOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-300 relative">
                        <button
                            onClick={() => setIsReviewOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-1">Rate Product</h2>
                        <p className="text-sm text-gray-500 mb-6">How was your experience with {selectedOrder?.listingId?.brandName}?</p>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <StarRating
                                label="Grain Quality"
                                value={reviewForm.grainQuality}
                                onChange={(val) => setReviewForm({ ...reviewForm, grainQuality: val })}
                            />
                            <StarRating
                                label="Cooking Result"
                                value={reviewForm.cookingResult}
                                onChange={(val) => setReviewForm({ ...reviewForm, cookingResult: val })}
                            />
                            <StarRating
                                label="Taste"
                                value={reviewForm.taste}
                                onChange={(val) => setReviewForm({ ...reviewForm, taste: val })}
                            />
                            <StarRating
                                label="Value for Money"
                                value={reviewForm.valueForMoney}
                                onChange={(val) => setReviewForm({ ...reviewForm, valueForMoney: val })}
                            />

                            <div>
                                <label className="text-sm font-bold text-gray-600 uppercase mb-2 block">Comment</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none text-sm min-h-[100px]"
                                    placeholder="Share your thoughts about this rice..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full btn-primary py-3 text-sm font-bold shadow-lg disabled:opacity-50 mt-2"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
