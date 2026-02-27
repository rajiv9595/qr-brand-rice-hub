import React, { useState, useEffect } from 'react';
import {
    Clock, CheckCircle, XCircle, Shield, ShoppingCart, IndianRupee,
    Briefcase, ArrowUpRight, Package, Users, MessageSquare, Award, TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';

const AdminDashboard = () => {
    const user = authService.getCurrentUser();
    const [stats, setStats] = useState({
        totalSuppliers: 0,
        totalListings: 0,
        pendingListings: 0,
        totalReviews: 0,
        totalExpertReviews: 0,
    });
    const [orderStats, setOrderStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        avgOrderValue: 0
    });
    const [chartData, setChartData] = useState({
        byDistrict: [],
        byCategory: [],
        reviewTrend: [],
        priceDistribution: [],
    });

    const [topSuppliers, setTopSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchTopSuppliers();
    }, []);

    const fetchTopSuppliers = async () => {
        try {
            const res = await adminService.getTopSuppliers();
            setTopSuppliers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch top suppliers', err);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [res, orderRes] = await Promise.all([
                adminService.getDashboardStats(),
                orderService.getAdminStats()
            ]);

            setStats(res.data.data || {});
            setOrderStats(orderRes.data.data || { totalSales: 0, totalOrders: 0 });
            setChartData(res.data.charts || {});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Revenue',
            value: `₹${orderStats.totalSales.toLocaleString()}`,
            icon: IndianRupee,
            color: 'bg-green-100 text-green-700',
            bgGradient: 'from-green-500 to-green-600'
        },
        {
            label: 'Total Orders',
            value: orderStats.totalOrders,
            icon: ShoppingCart,
            color: 'bg-blue-100 text-blue-700',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Total Suppliers',
            value: stats.totalSuppliers,
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Total Listings',
            value: stats.totalListings,
            icon: Package,
            color: 'bg-purple-100 text-purple-600',
            bgGradient: 'from-purple-500 to-purple-600'
        },
        {
            label: 'Pending Approval',
            value: stats.pendingListings,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
            bgGradient: 'from-yellow-500 to-yellow-600'
        },
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-[2rem] animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Admin Welcome Header */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-400" />
                            <span className="text-primary-400 font-bold uppercase text-xs tracking-widest">Administrator Access</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-400 max-w-xl">
                            Real-time monitoring of marketplace activity, sales performance, and verifications.
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-sm text-gray-500">System Status</p>
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Operational
                        </div>
                    </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-900/30 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="card p-6 hover:shadow-lg transition-all border-0 ring-1 ring-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-gradient-to-br from-yellow-50 to-white border-yellow-100/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Pending Approvals</h3>
                        <span className="badge badge-warning">{stats.pendingListings} New</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Review and approve new rice listings from suppliers.</p>
                    <a href="/admin/listings" className="btn-primary w-full text-center text-sm py-2">Review Pending</a>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Supplier Management</h3>
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-6">Verify new supplier registrations and manage documents.</p>
                    <a href="/admin/suppliers" className="btn-secondary w-full text-center text-sm py-2">Manage Suppliers</a>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Platform Analytics</h3>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-6">View detailed reports on traffic, sales, and user growth.</p>
                    <button className="btn-secondary w-full text-center text-sm py-2" disabled>Coming Soon</button>
                </div>
            </div>

            {/* Charts Grid */}
            {chartData.byDistrict && chartData.byDistrict.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Listings by District</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.byDistrict}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="district" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Category Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.byCategory || []}
                                    dataKey="count"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                >
                                    {(chartData.byCategory || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="card p-12 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Analytics Data Yet</h3>
                    <p className="text-gray-500">Charts will appear here once listing data is populated.</p>
                </div>
            )}

            {/* Top Suppliers Section */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Top Performing Suppliers</h3>
                        <p className="text-sm text-gray-500">Revenue breakdown by individual supplier</p>
                    </div>
                    <button className="text-field-600 hover:text-field-700 text-sm font-bold flex items-center gap-1">
                        View All <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Total Orders</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(topSuppliers || []).map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{supplier.name}</p>
                                                <p className="text-xs text-gray-500">ID: #{1000 + supplier.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{supplier.district}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">{supplier.orders}</span>
                                        <span className="text-xs text-gray-500 ml-1">orders</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-green-700">₹{supplier.revenue.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${supplier.growth >= 0
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                            }`}>
                                            {supplier.growth >= 0 ? '+' : ''}{supplier.growth}%
                                            <TrendingUp className={`w-3 h-3 ${supplier.growth < 0 ? 'rotate-180' : ''}`} />
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
