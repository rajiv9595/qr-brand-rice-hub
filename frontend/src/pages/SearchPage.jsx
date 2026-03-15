import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, MapPin, Tag, ArrowUpDown, Star, Scale, Info, Heart, XCircle, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/AppContext';
import { riceService, watchlistService } from '../services';
import { authService } from '../services/authService';
import ProfessionalAddressSearch from '../components/common/ProfessionalAddressSearch';
import { optimizeImage } from '../utils/imageOptimizer';

const SearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [pagination, setPagination] = useState({ totalResults: 0, totalPages: 0 });
    const [watchlist, setWatchlist] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('riceVariety') || '');
    const [marketTab, setMarketTab] = useState('all');
    const user = React.useMemo(() => authService.getCurrentUser(), []);
    const userId = user?._id;

    const { compareIds, toggleCompare, userLocation, setUserLocation } = useAppStore();
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

    const clearLocation = () => {
        setUserLocation(null);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('lat');
        newParams.delete('lng');
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

    // Calculate Budget/Premium Logic based on average price per variety
    const processedResults = React.useMemo(() => {
        const varietyStats = {};
        results.forEach(item => {
            const variety = item.riceVariety?.toLowerCase();
            if (!variety) return;
            const pricePerKg = item.pricePerBag / item.bagWeightKg;
            if (!varietyStats[variety]) {
                varietyStats[variety] = { prices: [], avg: 0 };
            }
            varietyStats[variety].prices.push(pricePerKg);
        });

        Object.keys(varietyStats).forEach(variety => {
            const prices = varietyStats[variety].prices;
            const sum = prices.reduce((a, b) => a + b, 0);
            varietyStats[variety].avg = sum / prices.length;
        });

        return results.map(item => {
            const variety = item.riceVariety?.toLowerCase();
            let isBudget = true;
            if (variety && varietyStats[variety]) {
                const pricePerKg = item.pricePerBag / item.bagWeightKg;
                isBudget = pricePerKg <= varietyStats[variety].avg;
            }
            return {
                ...item,
                budgetCategory: isBudget ? 'budget' : 'premium'
            };
        });
    }, [results]);

    const displayResults = React.useMemo(() => {
        if (marketTab === 'all') return processedResults;
        return processedResults.filter(item => item.budgetCategory === marketTab);
    }, [processedResults, marketTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-left w-full flex flex-col gap-4 relative z-40">
                {/* Location Selector (Swiggy Style) */}
                <div className="relative">
                    <button
                        onClick={() => setShowLocationPicker(!showLocationPicker)}
                        className="group flex flex-col items-start hover:bg-gray-50 p-2 -ml-2 rounded-2xl transition-all outline-none"
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="w-7 h-7 text-primary-600 fill-primary-100 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-display font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                                {userLocation ? 'Delivery Location' : 'Set Your Location'}
                            </span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-transform duration-300 ${showLocationPicker ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 pl-[36px]">
                            <span className="text-sm font-bold text-gray-500 truncate max-w-[200px] md:max-w-md">
                                {userLocation ? userLocation.name : 'Click here to fetch nearby rice suppliers'}
                            </span>
                            {userLocation && (
                                <span className="text-[10px] bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-black uppercase tracking-widest leading-none shadow-sm">
                                    Within 50km
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Location Picker Dropdown */}
                    {showLocationPicker && (
                        <>
                            {/* Backdrop across the whole screen to close when clicking outside */}
                            <div className="fixed inset-0 z-40 bg-gray-900/10 backdrop-blur-[1px]" onClick={() => setShowLocationPicker(false)} />

                            <div className="absolute top-full left-0 mt-4 w-full md:w-[450px] bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
                                <div className="flex justify-between items-center mb-5 px-1">
                                    <h3 className="font-display font-black text-xl text-gray-900 tracking-tight">Change Location</h3>
                                    <button onClick={() => setShowLocationPicker(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <ProfessionalAddressSearch
                                    onSelect={(loc) => {
                                        setUserLocation(loc);
                                        const newParams = new URLSearchParams(searchParams);
                                        if (loc.lat && loc.lng) {
                                            newParams.set('lat', loc.lat);
                                            newParams.set('lng', loc.lng);
                                        } else if (loc.state) {
                                            newParams.set('state', loc.state);
                                        }
                                        setSearchParams(newParams);
                                        setShowLocationPicker(false);
                                    }}
                                />

                                {userLocation && (
                                    <button
                                        onClick={() => {
                                            clearLocation();
                                            setShowLocationPicker(false);
                                        }}
                                        className="mt-6 w-full flex items-center justify-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 p-3.5 rounded-xl border border-red-100 transition-all shadow-sm"
                                    >
                                        <XCircle className="w-4 h-4" /> Clear & Show All India
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Search Bar & Stats */}
            <div className="flex flex-col gap-4">
                {/* Budget vs Premium Tabs */}
                <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-2xl w-full md:w-fit mx-auto border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setMarketTab('all')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${marketTab === 'all' ? 'bg-white text-gray-900 shadow drop-shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    >
                        {t("All Products")}
                    </button>
                    <button
                        onClick={() => setMarketTab('budget')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${marketTab === 'budget' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105 hover:bg-green-600' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
                    >
                        💰 {t("Budget Friendly")}
                    </button>
                    <button
                        onClick={() => setMarketTab('premium')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${marketTab === 'premium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105 hover:bg-amber-600' : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'}`}
                    >
                        ✨ {t("Premium")}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t("Search variety, brand...")}
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
                        {compareIds.length > 0 ? `${t("Analyze Selected")} (${compareIds.length})` : t('Comparison Mode')}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium tracking-tight">
                        {t("Found")} <span className="text-primary-700 font-bold">{pagination.totalResults}</span> {t("varieties")}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl border shadow-sm transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                                ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}
                            `}
                        >
                            <Filter className="w-4 h-4" /> {t("Filters")}
                        </button>
                        <select
                            className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary-500 outline-none"
                            onChange={(e) => updateParam('sortBy', e.target.value)}
                            value={searchParams.get('sortBy') || ''}
                        >
                            <option value="">{t("Sort By")}</option>
                            <option value="priceAsc">{t("Price: Low")}</option>
                            <option value="priceDesc">{t("Price: High")}</option>
                            <option value="newest">{t("Latest")}</option>
                        </select>
                    </div>
                </div>
            </div>



            {/* Advanced Filters Drawer/Section */}
            {showFilters && (
                <div className="card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("Use Category")}</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                            onChange={(e) => updateParam('usageCategory', e.target.value)}
                            value={searchParams.get('usageCategory') || ''}
                        >
                            <option value="">{t("All Uses")}</option>
                            <option value="Daily Cooking">{t("Daily Cooking")}</option>
                            <option value="Function & Event">{t("Function & Event")}</option>
                            <option value="Healthy Rice">{t("Healthy Rice")}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("Rice Type")}</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                            onChange={(e) => updateParam('riceType', e.target.value)}
                            value={searchParams.get('riceType') || ''}
                        >
                            <option value="">{t("All Types")}</option>
                            <option value="Raw">{t("Raw")}</option>
                            <option value="Steam">{t("Steam")}</option>
                            <option value="Boiled">{t("Boiled")}</option>
                            <option value="Brown">{t("Brown")}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("Pack Size")}</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                            onChange={(e) => updateParam('packSize', e.target.value)}
                            value={searchParams.get('packSize') || ''}
                        >
                            <option value="">{t("All Sizes")}</option>
                            <option value="500gm">500gm</option>
                            <option value="1kg">1kg</option>
                            <option value="5kg">5kg</option>
                            <option value="10kg">10kg</option>
                            <option value="26kg">26kg</option>
                            <option value="50kg">50kg</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("Distance")}</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold"
                            onChange={(e) => updateParam('distance', e.target.value)}
                            value={searchParams.get('distance') || ''}
                        >
                            <option value="2">Within 2km</option>
                            <option value="5">Within 5km</option>
                            <option value="10">Within 10km</option>
                            <option value="20">Within 20km</option>
                            <option value="50">Within 50km</option>
                        </select>
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
                    {displayResults.map((item) => (
                        <Link key={item._id} to={`/rice/${item._id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 transition-all duration-300 group overflow-hidden flex flex-col">

                            {/* Image Container with Consistent Aspect Ratio */}
                            <div className="aspect-[3/4] p-4 bg-rice-50 relative flex items-center justify-center overflow-hidden">
                                <img
                                    src={optimizeImage(item.bagImageUrl, 400) || 'https://via.placeholder.com/400x300?text=Rice+Bag'}
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
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                            <Tag className="w-3 h-3" /> {item.riceVariety}
                                        </p>
                                        {item.budgetCategory && (
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.budgetCategory === 'budget' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.budgetCategory === 'budget' ? 'Budget' : 'Premium'}
                                            </span>
                                        )}
                                    </div>
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
                    {displayResults.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="text-6xl">🌾</div>
                            <h3 className="text-xl font-bold text-gray-800">{t("No rice matches your filters.")}</h3>
                            <p className="text-gray-500">{t("Try adjusting your category or search terms.")}</p>
                            <button onClick={() => { setSearchParams({}); setMarketTab('all'); }} className="btn-primary">{t("Clear all filters")}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
