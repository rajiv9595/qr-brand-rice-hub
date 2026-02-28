import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Users, ShoppingCart, Activity, ArrowUpRight, ArrowDownRight,
    Calendar, Download, RefreshCw, BarChart2, Globe, Smartphone, Monitor,
    Map
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

import { adminService } from '../../services/adminService';

const PlatformAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('year'); // week, month, year
    const [analyticsData, setAnalyticsData] = useState({
        metrics: { grossVolume: 0, totalUsers: 0, avgOrderValue: 0, bounceRate: 0 },
        charts: {
            revenueData: [],
            topDistricts: [],
            trafficData: [],
            deviceData: []
        }
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await adminService.getPlatformAnalytics({ timeRange });
            if (res.data.success) {
                setAnalyticsData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const { metrics, charts } = analyticsData;
    const { revenueData, topDistricts, trafficData, deviceData } = charts;

    const StatCard = ({ title, value, prefix, trend, trendValue, icon: Icon, isPositive }) => (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/20 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-1">
                        {prefix && <span className="text-xl text-gray-400 font-bold">{prefix}</span>}
                        {value}
                    </h3>
                </div>
                <div className={`p-3 sm:p-4 rounded-2xl ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
                <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {trendValue}
                </span>
                <span className="text-sm text-gray-500">{trend}</span>
            </div>

            {/* Decorative bg element */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-2xl w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-[2rem]"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 bg-gray-200 rounded-[2rem]"></div>
                    <div className="h-96 bg-gray-200 rounded-[2rem]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Platform Analytics
                        <span className="bg-field-100 text-field-700 text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold">Pro</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Detailed reports on traffic, sales performance, and user growth.</p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        {['week', 'month', 'year'].map(t => (
                            <button
                                key={t}
                                onClick={() => { setLoading(true); setTimeRange(t); }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${timeRange === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button className="p-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors" title="Export PDF">
                        <Download className="w-5 h-5" />
                    </button>
                </div>

                {/* Decorative mesh */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-field-50 to-blue-50 opacity-50 blur-3xl -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none"></div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Gross Volume"
                    value={(metrics.grossVolume / 100000).toFixed(1) + 'L'}
                    prefix="₹"
                    trend="vs previous year"
                    trendValue="24.5%"
                    icon={TrendingUp}
                    isPositive={true}
                />
                <StatCard
                    title="Total Active Users"
                    value={metrics.totalUsers.toLocaleString()}
                    trend="vs previous year"
                    trendValue="18.2%"
                    icon={Users}
                    isPositive={true}
                />
                <StatCard
                    title="Average Order Value"
                    value={Math.round(metrics.avgOrderValue).toLocaleString()}
                    prefix="₹"
                    trend="vs previous year"
                    trendValue="5.4%"
                    icon={ShoppingCart}
                    isPositive={true}
                />
                <StatCard
                    title="Bounce Rate"
                    value={metrics.bounceRate.toFixed(1) + '%'}
                    trend="vs previous year"
                    trendValue="2.1%"
                    icon={Activity}
                    isPositive={false}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Revenue Overview</h2>
                            <p className="text-sm text-gray-500 font-medium">Monthly total sales across all districts</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 text-sm font-bold text-field-600 bg-field-50 px-4 py-2 rounded-xl hover:bg-field-100 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Sync
                        </button>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val / 1000}k`} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area type="monotone" name="2026 Sales" dataKey="total" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                <Area type="monotone" name="2025 Sales" dataKey="previous" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPrev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-gray-900">Device Traffic</h2>
                        <p className="text-sm text-gray-500 font-medium">Where your users are coming from</p>
                    </div>
                    <div className="h-[250px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    formatter={(value) => [`${value}%`, 'Share']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Custom Legend */}
                    <div className="space-y-4 mt-6">
                        {deviceData.map(device => (
                            <div key={device.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${device.color}15`, color: device.color }}>
                                        {device.name === 'Mobile' ? <Smartphone className="w-5 h-5" /> : device.name === 'Desktop' ? <Monitor className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                    </div>
                                    <span className="font-bold text-gray-700">{device.name}</span>
                                </div>
                                <span className="font-black text-gray-900 text-lg">{device.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Traffic Bar Chart */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-gray-900">Weekly Traffic Trends</h2>
                        <p className="text-sm text-gray-500 font-medium">Active vs New users over the week</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trafficData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Bar dataKey="active" name="Active Users" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={20} />
                                <Bar dataKey="new" name="New Signups" fill="#fbbf24" radius={[6, 6, 6, 6]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Regions List */}
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Top Performing Regions</h2>
                            <p className="text-sm text-gray-500 font-medium">Sales volume by district</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Map className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-5">
                        {topDistricts.map((district, index) => (
                            <div key={district.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index < 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors cursor-default">{district.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900">₹{(district.sales / 100000).toFixed(1)}L</p>
                                    <p className={`text-xs font-bold ${district.growth.includes('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {district.growth}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PlatformAnalytics;
