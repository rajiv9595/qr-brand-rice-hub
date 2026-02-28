import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter, BookOpen, Star, DollarSign, Truck, X, MapPin } from 'lucide-react';
import { marketService } from '../services';

const MOCK_UPDATES = [
    {
        _id: 'k1',
        title: 'How to Identify Quality Rice Before Buying',
        description: 'Learn to check grain length, color uniformity, broken grain percentage, and aroma to identify premium rice. A simple guide for every household...',
        category: 'Quality',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
        createdBy: { name: 'QR Brand Research Team' },
        createdAt: '2026-02-15'
    },
    {
        _id: 'k2',
        title: 'Rice Market Trends: February 2026 Update',
        description: 'Sona Masoori prices have stabilized at ₹48-55/kg. Basmati shows a slight upward trend due to export demand. Farmers in Godavari districts are expecting a bumper harvest this season.',
        category: 'Market Trends',
        createdBy: { name: 'QR Brand Market Analysts' },
        createdAt: '2026-02-14'
    },
    {
        _id: 'k3',
        title: 'Understanding Rice Varieties in Telugu States',
        description: 'Telugu states produce some of India\'s finest rice varieties: Sona Masoori (most popular), BPT 5204, HMT, Kolam. Understand which variety suits your cooking style best.',
        category: 'Education',
        createdBy: { name: 'QR Brand Expert Team' },
        createdAt: '2026-02-12'
    },
    {
        _id: 'k4',
        title: 'Minimum Support Price (MSP) Revised for 2026',
        description: 'The government has officially increased the MSP for Grade A paddy by ₹143 per quintal. This move is expected to boost farmer income significantly across the delta regions.',
        category: 'Price Alerts',
        createdBy: { name: 'Policy Watch' },
        createdAt: '2026-02-10'
    },
    {
        _id: 'k5',
        title: 'Supply Chain Disruptions: Transport Strike Update',
        description: 'Due to the ongoing transport strike in neighboring states, rice arrivals at major market yards in Vijayawada and Guntur might see a temporary delay of 2-3 days.',
        category: 'Supply Updates',
        createdBy: { name: 'Logistics Team' },
        createdAt: '2026-02-08'
    },
    {
        _id: 'k6',
        title: 'Organic Rice Formatting: A Growing Trend',
        description: 'More farmers in Telangana are shifting towards organic paddy cultivation. Yields are lower, but the market demand and price premium for chemical-free rice are at an all-time high.',
        category: 'Market Trends',
        createdBy: { name: 'Agri-Tech News' },
        createdAt: '2026-02-05'
    }
];

const MarketPage = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ state: '', category: '' });
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        const fetchUpdates = async () => {
            setLoading(true);
            try {
                const res = await marketService.getMarketUpdates(filters);
                setUpdates(res.data.updates || []);
            } catch (err) {
                console.error('Market Updates Fetch Error:', err);
                setUpdates([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUpdates();
    }, [filters]);

    const toggleFilter = (key, val) => {
        setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }));
    };

    const getImageForCategory = (category, index) => {
        const images = [
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop', // Rice Piles (Quality/Education)
            'https://images.unsplash.com/photo-1599940829620-e3eb6f98f7e3?q=80&w=600&auto=format&fit=crop', // Sacks (Supply)
            'https://images.unsplash.com/photo-1536704689578-8f5ae225ca6b?q=80&w=600&auto=format&fit=crop', // Fields (Market)
            'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop', // Raw Rice (General)
        ];
        if (category?.toLowerCase().includes('price')) return images[1];
        if (category?.toLowerCase().includes('supply')) return images[2];
        return images[index % images.length];
    };

    const categories = [
        { label: "All Updates", icon: BookOpen },
        { label: "Education", icon: BookOpen },
        { label: "Quality", icon: Star },
        { label: "Market Trends", icon: TrendingUp },
        { label: "Price Alerts", icon: DollarSign },
        { label: "Supply Updates", icon: Truck },
    ];

    return (
        <div className="w-full max-w-[90rem] ml-0 px-4 md:px-12 py-12 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="text-left space-y-2">
                <h1 className="text-2xl md:text-4xl text-field-900 font-display font-bold tracking-tight">Rice Knowledge & Market Intelligence</h1>
                <p className="text-gray-500 text-base md:text-lg max-w-2xl">Stay updated with rice market trends, quality tips, price alerts, and supply information.</p>
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-4 no-scrollbar items-center gap-3 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat.label}
                        onClick={() => toggleFilter('category', cat.label === "All Updates" ? "" : cat.label)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all border ${(filters.category === cat.label || (cat.label === "All Updates" && !filters.category))
                            ? 'bg-field-800 text-white border-field-800 shadow-md transform scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-field-300 hover:text-field-700'
                            }`}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {updates.map((item, index) => (
                        <div
                            key={item._id}
                            onClick={() => setSelectedArticle(item)}
                            className="bg-white rounded-[2rem] hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group h-full border border-gray-100 cursor-pointer transform hover:-translate-y-1"
                        >
                            {/* Card Image */}
                            <div className="h-64 relative overflow-hidden">
                                <img
                                    src={item.imageUrl || getImageForCategory(item.category, index)}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex flex-col flex-1 space-y-4">
                                {/* Category Badge */}
                                <div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.category?.includes('Price') ? 'bg-green-50 text-green-700' :
                                        item.category?.includes('Market') ? 'bg-blue-50 text-blue-700' :
                                            item.category?.includes('Supply') ? 'bg-gray-100 text-gray-700' :
                                                item.category?.includes('Quality') ? 'bg-emerald-50 text-emerald-700' :
                                                    'bg-orange-50 text-orange-700'
                                        }`}>
                                        {item.category || 'Update'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-display font-bold text-field-900 leading-snug group-hover:text-field-700 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                    {item.description}
                                </p>

                                <div className="pt-6 mt-auto flex items-center justify-between text-xs text-gray-400 font-bold">
                                    <span className="text-gray-400 font-medium">{item.createdBy?.name || 'QR Brand Team'}</span>
                                    <span className="text-gray-400">{new Date(item.createdAt).toISOString().split('T')[0]}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && updates.length === 0 && (
                <div className="text-center py-32 space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No market updates found</h3>
                    <p className="text-gray-500">Try adjusting your selected filters.</p>
                </div>
            )}

            {/* Article Reading Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6" onClick={() => setSelectedArticle(null)}>
                    <div
                        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="h-64 sm:h-80 relative w-full overflow-hidden shrink-0">
                            <img
                                src={selectedArticle.imageUrl || getImageForCategory(selectedArticle.category, updates.findIndex(u => u._id === selectedArticle._id))}
                                alt={selectedArticle.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-max mb-4 ${selectedArticle.category?.includes('Price') ? 'bg-green-500 text-white' :
                                    selectedArticle.category?.includes('Market') ? 'bg-blue-500 text-white' :
                                        selectedArticle.category?.includes('Supply') ? 'bg-gray-100 text-gray-800' :
                                            selectedArticle.category?.includes('Quality') ? 'bg-emerald-500 text-white' :
                                                'bg-orange-500 text-white'
                                    }`}>
                                    {selectedArticle.category || 'Update'}
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
                                    {selectedArticle.title}
                                </h2>
                            </div>
                        </div>

                        <div className="p-8 sm:p-12 bg-white">
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-field-100 text-field-700 flex items-center justify-center font-bold">
                                        {selectedArticle.createdBy?.name?.charAt(0) || 'Q'}
                                    </div>
                                    <span className="text-gray-900 font-bold">{selectedArticle.createdBy?.name || 'QR Brand Team'}</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <span>{new Date(selectedArticle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>

                                {(selectedArticle.district || selectedArticle.state) && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1.5 text-field-600 bg-field-50 px-3 py-1 rounded-full">
                                            <MapPin className="w-4 h-4" />
                                            {selectedArticle.district}{selectedArticle.district && selectedArticle.state ? ', ' : ''}{selectedArticle.state}
                                        </span>
                                    </>
                                )}
                            </div>

                            <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-body whitespace-pre-wrap">
                                {selectedArticle.description}
                            </article>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketPage;
