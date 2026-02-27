import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { Package, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const SupplierOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getSupplierOrders();
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;

        setUpdating(orderId);
        try {
            await orderService.updateStatus(orderId, newStatus);
            fetchOrders(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Confirmed: 'bg-blue-100 text-blue-800',
            Shipped: 'bg-indigo-100 text-indigo-800',
            Delivered: 'bg-green-100 text-green-800',
            Cancelled: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading orders...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
                    <p className="text-gray-500">Manage incoming orders and shipments.</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg">No orders yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order._id} className="card p-6 flex flex-col md:flex-row gap-6">
                            {/* Order Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400 w-32">ORDER ID</span>
                                    <span className="font-mono text-xs text-gray-500">#{order.orderId || order._id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-inner border border-gray-100">
                                        <img
                                            src={order.listingId?.bagImageUrl || `https://placehold.co/100x100?text=Rice`}
                                            alt={order.listingId?.brandName || 'Product'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/100x100?text=No+Image';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{order.listingId?.brandName || 'Deleted Listing'}</h3>
                                        <p className="text-sm text-gray-500">{order.listingId?.riceVariety || 'Unknown Variety'} • {order.quantity} Bags</p>
                                        <p className="text-sm font-bold text-primary-600 mt-1">₹{order.totalPrice}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Customer</span>
                                        <p className="font-medium text-gray-800">{order.buyerId?.name}</p>
                                        <p className="text-gray-500">{order.buyerId?.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Shipping Details</span>
                                        <p className="text-gray-600">
                                            {order.shippingAddress.city}, {order.shippingAddress.state}
                                            <br />
                                            {order.shippingAddress.street}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions & Status */}
                            <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="space-y-2">
                                    {order.status === 'Pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                                            disabled={updating === order._id}
                                            className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Confirm Order
                                        </button>
                                    )}
                                    {order.status === 'Confirmed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                            disabled={updating === order._id}
                                            className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                                        >
                                            <Truck className="w-4 h-4" /> Ship Order
                                        </button>
                                    )}
                                    {order.status === 'Shipped' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                            disabled={updating === order._id}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm py-2 flex items-center justify-center gap-2 transition-all"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Mark Delivered
                                        </button>
                                    )}
                                    {['Pending', 'Confirmed'].includes(order.status) && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                            disabled={updating === order._id}
                                            className="w-full text-red-500 hover:bg-red-50 font-bold rounded-xl text-sm py-2 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {['Delivered', 'Cancelled'].includes(order.status) && (
                                        <p className="text-center text-xs text-gray-400 italic mt-4">No further actions.</p>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 text-center mt-4">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupplierOrders;
