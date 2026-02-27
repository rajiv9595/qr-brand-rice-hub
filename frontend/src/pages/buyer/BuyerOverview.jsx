import React, { useEffect, useState } from 'react';
import { ShoppingBag, ChevronRight, Package, Clock } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const BuyerOverview = () => {
    const user = authService.getCurrentUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderService.getMyOrders();
                setOrders(res.data.data.slice(0, 3)); // Show only recent 3
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-primary-100 max-w-lg">
                        Track your rice orders and manage your account details securely.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Link to="/search" className="btn bg-white text-primary-700 hover:bg-white/90 font-bold border-0 shadow-lg">
                            Browse Market
                        </Link>
                        <Link to="/buyer/orders" className="btn bg-primary-700/50 hover:bg-primary-700 text-white font-bold border border-white/20">
                            View All Orders
                        </Link>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-10 right-20 w-32 h-32 bg-gold-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Recent Orders Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" /> Recent Purchases
                    </h2>
                    <Link to="/buyer/orders" className="text-primary-600 text-sm font-bold flex items-center hover:underline">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <div key={order._id} className="card p-5 hover:shadow-lg transition-all border border-gray-100 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                                        <Package className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{order.listingId?.brandName || 'Rice Item'}</h3>
                                <p className="text-xs text-gray-500 mb-4">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-mono font-bold text-gray-900">₹{order.totalPrice}</span>
                                    <Link to={`/buyer/orders`} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center border-dashed border-2 border-gray-200">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900">No orders yet</h3>
                        <p className="text-gray-500 mb-6 text-sm">Start exploring fresh rice from verified mills.</p>
                        <Link to="/search" className="btn-primary inline-flex items-center gap-2">
                            Start Shopping <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerOverview;
