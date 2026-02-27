import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, MapPin, Tag, ArrowUpDown, Star } from 'lucide-react';
import { riceService } from '../services';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ totalResults: 0, totalPages: 0 });

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries([...searchParams]);
            const res = await riceService.searchListings({ limit: 10, ...params });
            setResults(res.data.results);
            setPagination({
                totalResults: res.data.totalResults,
                totalPages: res.data.totalPages
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">Marketplace</h1>
                    <p className="text-gray-500 mt-1">Browse premium rice listings from verified mills</p>
                </div>
            </div>
            {/* Search Bar & Stats */}
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search variety, brand..."
                        className="w-full card py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                        value={searchParams.get('riceVariety') || ''}
                        onChange={(e) => updateParam('riceVariety', e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium tracking-tight">
                        Showing <span className="text-primary-700 font-bold">{pagination.totalResults}</span> products
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg border shadow-sm transition-all ${showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <select
                            className="bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                            onChange={(e) => updateParam('sortBy', e.target.value)}
                            value={searchParams.get('sortBy') || ''}
                        >
                            <option value="">Sort By</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="newest">Newest First</option>
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
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
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
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
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
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
                                value={searchParams.get('minPrice') || ''}
                                onChange={(e) => updateParam('minPrice', e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Max Price</label>
                            <input
                                type="number"
                                placeholder="₹"
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500"
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
                                {item.averageRating > 0 && (
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-rice-100 z-10">
                                        <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                                        <span className="text-[10px] font-bold text-gray-700">{item.averageRating}</span>
                                    </div>
                                )}
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
