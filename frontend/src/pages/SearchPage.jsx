import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, MapPin, Tag, ArrowUpDown, Star, Scale, Info, Heart, XCircle, X } from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { riceService, watchlistService } from '../services';
import { authService } from '../services/authService';

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ totalResults: 0, totalPages: 0 });
    const [watchlist, setWatchlist] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('riceVariety') || '');
    const user = React.useMemo(() => authService.getCurrentUser(), []);
    const userId = user?._id;

    const { compareIds, toggleCompare } = useAppStore();
    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries([...searchParams]);
            const res = await riceService.searchListings({ limit: 10, ...params });
            setResults(res.data.results || []);
            setPagination({
                totalResults: res.data.totalResults || 0,
                totalPages: res.data.totalPages || 0
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchParams.toString()]); // Stable string dependency

    const fetchWatchlist = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await watchlistService.getMyWatchlist();
            setWatchlist(res.data.data.map(item => item.listingId._id));
        } catch (err) {
            console.error(err);
        }
    }, [userId]);

    useEffect(() => {
        fetchResults();
        fetchWatchlist();
    }, [fetchResults, fetchWatchlist]);

    const toggleWatchlist = async (e, listingId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert('Please login to use watchlist');

        try {
            if (watchlist.includes(listingId)) {
                // Find the watchItem ID (simplified: fetch again or manage map)
                // For now, let's just use the toggle logic
                // Refetch is safer for now
                const res = await watchlistService.getMyWatchlist();
                const item = res.data.data.find(i => i.listingId._id === listingId);
                if (item) await watchlistService.removeFromWatchlist(item._id);
            } else {
                await watchlistService.addToWatchlist({ listingId });
            }
            fetchWatchlist();
        } catch (err) {
            console.error(err);
        }
    };

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get('riceVariety') || '')) {
                updateParam('riceVariety', searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left w-full">
                    <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900 tracking-tight">Marketplace</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Browse premium rice listings from verified mills</p>
                </div>
            </div>
            {/* Search Bar & Stats */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search variety, brand..."
                            className="w-full card py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>

                    {/* Comparison Mode Toggle */}
                    <button
                        onClick={() => {
                            if (compareIds.length > 0 && !showFilters) {
                                navigate(`/compare?ids=${compareIds.join(',')}`);
                            } else {
                                setShowFilters(!showFilters);
                            }
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg
                            ${compareIds.length > 0 ? 'bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}
                        `}
                    >
                        <Scale className={`w-4 h-4 ${compareIds.length > 0 ? 'animate-bounce' : ''}`} />
                        {compareIds.length > 0 ? `Analyze ${compareIds.length} Selected` : 'Comparison Mode'}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium tracking-tight">
                        Found <span className="text-primary-700 font-bold">{pagination.totalResults}</span> varieties
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl border shadow-sm transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                                ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <select
                            className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary-500 outline-none"
                            onChange={(e) => updateParam('sortBy', e.target.value)}
                            value={searchParams.get('sortBy') || ''}
                        >
                            <option value="">Sort By</option>
                            <option value="priceAsc">Price: Low</option>
                            <option value="priceDesc">Price: High</option>
                            <option value="newest">Latest</option>
                        </select>
                    </div>
                </div>
            </div>



            {/* Advanced Filters Drawer/Section */}
            {showFilters && (
                <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                            onChange={(e) => updateParam('usageCategory', e.target.value)}
                            value={searchParams.get('usageCategory') || ''}
                        >
                            <option value="">All Uses</option>
                            <option value="Daily Family Use">Daily Family Use</option>
                            <option value="Guests/Special Meal Use">Guests/Special Meal Use</option>
                            <option value="Biryani/Pulao Special">Biryani/Pulao Special</option>
                            <option value="Hotel/Commercial Use">Hotel/Commercial Use</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">State</label>
                        <input
                            type="text"
                            placeholder="e.g. Haryana"
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                            value={searchParams.get('state') || ''}
                            onChange={(e) => updateParam('state', e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Min Price</label>
                            <input
                                type="number"
                                placeholder="₹"
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                                value={searchParams.get('minPrice') || ''}
                                onChange={(e) => updateParam('minPrice', e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Max Price</label>
                            <input
                                type="number"
                                placeholder="₹"
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                                value={searchParams.get('maxPrice') || ''}
                                onChange={(e) => updateParam('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-200 rounded-3xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
                    {results.map((item) => (
                        <Link key={item._id} to={`/rice/${item._id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 transition-all duration-300 group overflow-hidden flex flex-col">

                            {/* Image Container with Consistent Aspect Ratio */}
                            <div className="aspect-[3/4] p-4 bg-rice-50 relative flex items-center justify-center overflow-hidden">
                                <img
                                    src={item.bagImageUrl || 'https://via.placeholder.com/400x300?text=Rice+Bag'}
                                    alt={item.brandName}
                                    className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                                    {item.averageRating > 0 && (
                                        <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-rice-100 w-fit ml-auto">
                                            <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                                            <span className="text-[10px] font-bold text-gray-700">{item.averageRating}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(item._id); }}
                                        className={`p-2 rounded-full shadow-lg transition-all ${compareIds.includes(item._id) ? 'bg-primary-600 text-white' : 'bg-white text-gray-400 hover:text-primary-600'}`}
                                        title="Compare this item"
                                    >
                                        <Scale className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => toggleWatchlist(e, item._id)}
                                        className={`p-2 rounded-full shadow-lg transition-all ${watchlist.includes(item._id) ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                                        title="Watch this item for price drops"
                                    >
                                        <Heart className={`w-4 h-4 ${watchlist.includes(item._id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Minimal Details */}
                            <div className="p-4 flex flex-col flex-1">
                                <div className="mb-auto">
                                    <h3 className="font-display font-bold text-gray-900 group-hover:text-field-700 transition-colors truncate text-base mb-1">
                                        {item.brandName}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> {item.riceVariety}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-50 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{item.bagWeightKg}kg Bag</p>
                                        <span className="font-body font-black text-field-700 text-lg leading-none">₹{item.pricePerBag}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                                            <MapPin className="w-2.5 h-2.5" /> {item.supplierId.district}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {results.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="text-6xl">🌾</div>
                            <h3 className="text-xl font-bold text-gray-800">No rice matches your search.</h3>
                            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                            <button onClick={() => setSearchParams({})} className="btn-primary">Clear all filters</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
