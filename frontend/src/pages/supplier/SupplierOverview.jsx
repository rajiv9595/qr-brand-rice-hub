import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, CheckCircle, Clock, XCircle, TrendingUp, Zap, Award, Star, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import MarketBenchmarking from '../../components/supplier/MarketBenchmarking';
import api from '../../services/api';

const SupplierOverview = () => {
    // Consume shared context from Layout
    const { stats, loadingStats, profile } = useOutletContext();
    const user = authService.getCurrentUser();

    const ICON_MAP = {
        Zap: Zap,
        Award: Award,
        Star: Star,
        ShieldCheck: ShieldCheck
    };

    // Use loadingStats from layout
    const loading = loadingStats;

    const statCards = [
        {
            label: 'Total Listings',
            value: stats?.total || 0,
            icon: Package,
            color: 'bg-blue-100 text-blue-600',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Approved',
            value: stats?.approved || 0,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
            bgGradient: 'from-green-500 to-green-600'
        },
        {
            label: 'Pending Review',
            value: stats?.pending || 0,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
            bgGradient: 'from-yellow-500 to-yellow-600'
        },
        {
            label: 'Rejected',
            value: stats?.rejected || 0,
            icon: XCircle,
            color: 'bg-red-100 text-red-600',
            bgGradient: 'from-red-500 to-red-600'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-gold-500" />
                        <span className="text-gold-500 font-black uppercase text-sm tracking-widest">Dashboard</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
                        Welcome back, <br />
                        <span className="text-gold-400 drop-shadow-sm">{user?.name || 'Supplier'}!</span>
                    </h1>
                    <p className="text-primary-100 text-lg">
                        Manage your rice listings, track approvals, and grow your business on QR BRAND marketplace.
                    </p>

                    {/* Performance Badges */}
                    {profile?.badges?.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-4">
                            {profile.badges.map((badge, idx) => {
                                const Icon = ICON_MAP[badge.icon] || Award;
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 group/badge cursor-help transition-all hover:bg-white/20"
                                        title={badge.description}
                                    >
                                        <Icon className={`w-4 h-4 ${badge.color || 'text-gold-400'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{badge.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/20 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="card p-6 hover:shadow-lg transition-all group border-0 ring-1 ring-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    {/* Optional: Add percentage trend here if available */}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* AI Insights & Benchmarking */}
            <MarketBenchmarking />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-8 bg-gradient-to-br from-primary-50/50 to-white/50 border-primary-100/50 backdrop-blur-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-2">Ready to add a new product?</h3>
                    <p className="text-gray-600 mb-6">Create a new rice listing and reach thousands of buyers.</p>
                    <a href="/supplier/create" className="btn-primary inline-flex items-center gap-2 shadow-xl shadow-primary-500/20">
                        <Package className="w-5 h-5" />
                        Create New Listing
                    </a>
                </div>

                <div className="card p-8 bg-gradient-to-br from-blue-50/50 to-white/50 border-blue-100/50 backdrop-blur-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-2">Manage your inventory</h3>
                    <p className="text-gray-600 mb-6">View, edit, and track all your rice listings in one place.</p>
                    <a href="/supplier/listings" className="btn-secondary inline-flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        View All Listings
                    </a>
                </div>
            </div>

            {/* Tips Section */}
            <div className="card p-8 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border border-yellow-100 group hover:border-yellow-200 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-400 rounded-2xl shadow-lg shadow-yellow-400/30 shrink-0 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 mb-3">💡 Pro Tips for Success</h4>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></span>
                                <span>Upload high-quality images of your rice bags and grains for better visibility.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></span>
                                <span>Keep your stock levels updated to avoid customer disappointment.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></span>
                                <span>Respond quickly to admin feedback on rejected listings to get re-approved faster.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierOverview;
