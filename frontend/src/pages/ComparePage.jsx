import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
    BarChart2, Plus, X, ArrowRight, ShoppingBag,
    Star, ShieldCheck, MapPin, Scale, ChevronRight,
    TrendingUp, Award, Box, Zap, Timer, Droplets,
    Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import { riceService } from '../services';

const ComparePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const idsString = searchParams.get('ids') || '';
    const [listingIds, setListingIds] = useState(idsString ? idsString.split(',') : []);
    const [comparisonData, setComparisonData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchComparison = async () => {
            if (listingIds.length === 0) {
                setComparisonData([]);
                return;
            }
            setLoading(true);
            try {
                const res = await riceService.compareListings(listingIds);
                setComparisonData(res.data.comparison);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchComparison();
    }, [listingIds]);

    const removeListing = (id) => {
        const newList = listingIds.filter(lid => lid !== id);
        setListingIds(newList);
        if (newList.length > 0) {
            setSearchParams({ ids: newList.join(',') });
        } else {
            setSearchParams({});
        }
    };

    // Helper to find the "winner" for a numeric field
    const getWinner = (field, isLowestBetter = false) => {
        if (comparisonData.length < 2) return null;
        const vals = comparisonData.map(item => {
            if (field.includes('.')) {
                const parts = field.split('.');
                return item[parts[0]]?.[parts[1]];
            }
            return item[field];
        });
        const target = isLowestBetter ? Math.min(...vals) : Math.max(...vals);
        return comparisonData.find(item => {
            if (field.includes('.')) {
                const parts = field.split('.');
                return item[parts[0]]?.[parts[1]] === target;
            }
            return item[field] === target;
        })?.id;
    };

    const SpecRow = ({ label, field, icon: Icon, isPrice = false, suffix = '', isLowestBetter = false }) => {
        const winnerId = getWinner(field, isLowestBetter);
        return (
            <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 py-4 border-b border-gray-50 items-center">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                </div>
                {comparisonData.map(item => {
                    const val = field.includes('.') ? item[field.split('.')[0]]?.[field.split('.')[1]] : item[field];
                    const isWinner = item.id === winnerId;
                    return (
                        <div key={item.id} className={`text-center px-4 py-2 rounded-xl transition-all ${isWinner ? 'bg-primary-50 ring-1 ring-primary-100' : ''}`}>
                            <span className={`text-sm font-bold ${isWinner ? 'text-primary-700' : 'text-gray-700'}`}>
                                {isPrice && '₹'}{val}{suffix}
                            </span>
                            {isWinner && (
                                <div className="text-[8px] font-black text-primary-500 uppercase tracking-tighter mt-0.5">Best Choice</div>
                            )}
                        </div>
                    );
                })}
                {/* Fill empty columns if less than 3 */}
                {[...Array(3 - comparisonData.length)].map((_, i) => (
                    <div key={i} className="text-center opacity-10">—</div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-gray-900">Conducting Lab Analysis</h3>
                <p className="text-gray-400 font-medium">Comparing purity, moisture, and grain metrics...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 space-y-12 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="relative">
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -z-10" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-primary-100 shadow-sm">
                            <Zap className="w-3 h-3 text-primary-500 fill-primary-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-700">Analytical Lab</span>
                        </div>
                        <h1 className="text-5xl font-display font-black text-gray-900 tracking-tight leading-none">
                            Side-by-Side <span className="text-primary-600">Comparison</span>
                        </h1>
                        <p className="text-lg text-gray-500 font-medium max-w-2xl">
                            Scientific breakdown of grain quality, purity, and market value for your selected varieties.
                        </p>
                    </div>
                    {listingIds.length > 0 && (
                        <button
                            onClick={() => { setListingIds([]); setSearchParams({}); }}
                            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
                        >
                            <X className="w-4 h-4" /> Reset Workspace
                        </button>
                    )}
                </div>
            </div>

            {listingIds.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 animate-pulse" />
                        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-primary-50">
                            <Scale className="w-10 h-10 text-primary-600" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-gray-900">Workspace Empty</h2>
                        <p className="text-gray-400 font-medium max-w-xs mx-auto">Select up to 3 brands from the marketplace to start your professional analysis.</p>
                    </div>
                    <Link to="/search" className="group btn-primary !px-12 !py-5 flex items-center gap-3 text-lg rounded-[2rem] shadow-2xl shadow-primary-200">
                        Explore Market <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Visual Comparison Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {comparisonData.map((item, idx) => (
                            <div key={item.id} className="relative group animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                <button
                                    onClick={() => removeListing(item.id)}
                                    className="absolute -top-4 -right-4 z-20 w-12 h-12 bg-white shadow-2xl border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:rotate-90 transition-all duration-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="bg-white rounded-[3rem] p-4 pb-8 overflow-hidden border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col h-full hover:shadow-primary-100/50 transition-all duration-500">
                                    <div className="relative aspect-[4/5] bg-rice-50 rounded-[2.5rem] p-8 flex items-center justify-center overflow-hidden mb-8">
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/40 to-transparent" />
                                        <img
                                            src={item.bagImageUrl || 'https://placehold.co/400x500?text=Rice'}
                                            alt={item.brandName}
                                            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform duration-700 relative z-10"
                                        />
                                        <div className="absolute top-6 left-6 text-[10px] font-black uppercase text-white bg-primary-600/90 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                                            {item.riceVariety}
                                        </div>
                                    </div>

                                    <div className="px-6 space-y-6 flex-1 flex flex-col">
                                        <div className="text-center">
                                            <h3 className="text-2xl font-black text-gray-900 mb-1">{item.brandName}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{item.usageCategory}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                                                </div>
                                                <span className="text-sm font-black text-gray-900">{item.averageRating || '—'}</span>
                                            </div>
                                            <div className="h-6 w-px bg-gray-200" />
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Price</p>
                                                <p className="text-base font-black text-primary-600Leading-none">₹{item.pricePerBag}</p>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/rice/${item.id}`}
                                            className="mt-auto w-full bg-gray-900 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 transition-all"
                                        >
                                            View Full Specs <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {comparisonData.length < 3 && (
                            <Link
                                to="/search"
                                className="h-full min-h-[550px] rounded-[3rem] border-4 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center p-12 text-center group hover:border-primary-200 hover:bg-primary-50/20 transition-all duration-500"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-12 transition-all">
                                    <Plus className="w-10 h-10 text-gray-300 group-hover:text-primary-500" />
                                </div>
                                <h4 className="text-xl font-black text-gray-400 group-hover:text-primary-700 transition-colors">Add Brand</h4>
                                <p className="text-xs text-gray-400 font-medium max-w-[180px] mt-2 italic group-hover:text-primary-500 transition-colors">Add up to {3 - comparisonData.length} more variety to finalize comparison.</p>
                            </Link>
                        )}
                    </div>

                    {/* Technical Specifications Table */}
                    <div className="card p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-gray-100 rounded-[3rem]">
                        <div className="bg-gray-900 p-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Activity className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Technical Metrics</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Scientific side-by-side analysis</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-6">
                                {comparisonData.map(item => (
                                    <div key={item.id} className="text-center w-32 border-l border-white/10 pl-6">
                                        <p className="text-[10px] font-black text-primary-400 uppercase truncate mb-1">{item.brandName}</p>
                                        <div className="w-2 h-2 rounded-full bg-primary-500 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 space-y-2 bg-white">
                            <SpecRow label="Current Price" field="pricePerBag" isPrice isLowestBetter icon={TrendingUp} />
                            <SpecRow label="Grain Length" field="specifications.grainLength" icon={Scale} />
                            <SpecRow label="Rice Purity" field="specifications.purityPercentage" suffix="%" icon={ShieldCheck} />
                            <SpecRow label="Broken Grains" field="specifications.brokenGrainPercentage" suffix="%" isLowestBetter icon={AlertCircle} />
                            <SpecRow label="Moisture" field="specifications.moistureContent" suffix="%" isLowestBetter icon={Droplets} />
                            <SpecRow label="Age of Rice" field="specifications.riceAge" icon={Timer} />
                            <SpecRow label="Cooking Time" field="specifications.cookingTime" icon={Timer} />
                            <SpecRow label="Dispatch" field="dispatchTimeline" icon={Zap} />

                            {/* Source Mill Breakdown */}
                            <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 py-8 items-center bg-gray-50/50 rounded-[2rem] px-6 mt-8">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Source Mill</span>
                                </div>
                                {comparisonData.map(item => (
                                    <div key={item.id} className="text-center space-y-1">
                                        <p className="text-sm font-black text-gray-900">{item.supplier?.millName || 'Verified Mill'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{item.supplier?.district}, {item.supplier?.state}</p>
                                        <div className="mt-3 flex justify-center">
                                            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border border-green-100">
                                                <CheckCircle2 className="w-3 h-3" /> Verified Hub
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Final Analysis Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                        <div className="card p-10 bg-primary-600 text-white space-y-6 flex flex-col justify-center">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black">Expert Recommendation</h3>
                                <p className="text-primary-100">Based on your selection, here is our analytical conclusion.</p>
                            </div>
                            <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur">
                                <p className="text-sm italic font-medium leading-relaxed">
                                    "For standard family usage, {comparisonData.find(i => i.id === getWinner('pricePerBag', true))?.brandName} offers the most competitive value. However, for specialized cooking, {comparisonData.find(i => i.id === getWinner('ratingDetails.cookingResultAvg'))?.brandName} shows superior grain length metrics."
                                </p>
                            </div>
                        </div>
                        <div className="card p-10 bg-white border border-gray-100 shadow-xl flex flex-col justify-center space-y-6">
                            <h3 className="text-xl font-black text-gray-900">What's Next?</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">1</div>
                                    <p className="text-sm font-bold text-gray-600">Review technical specs above carefully.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">2</div>
                                    <p className="text-sm font-bold text-gray-600">Click 'View Full Specs' for detailed cooking tests.</p>
                                </div>
                                <button className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 group">
                                    Download Comparative PDF <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparePage;


