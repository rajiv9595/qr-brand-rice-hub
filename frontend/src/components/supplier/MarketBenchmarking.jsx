import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Info, MapPin } from 'lucide-react';

const MarketBenchmarking = () => {
    const [benchmarks, setBenchmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBenchmarks = async () => {
            try {
                const res = await api.get('/supplier/insights/benchmarking');
                setBenchmarks(res.data.data);
            } catch (err) {
                console.error('Failed to fetch benchmarks', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBenchmarks();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-3xl" />;
    if (benchmarks.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Market Benchmarking</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Local District Stats</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benchmarks.map((item) => (
                    <div key={item.listingId} className="card p-5 hover:shadow-xl transition-all border border-gray-100 group relative overflow-hidden bg-white">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">{item.variety}</p>
                                <h4 className="text-lg font-black text-gray-900 leading-tight">{item.brandName}</h4>
                            </div>
                            <div className={`p-2 rounded-xl scale-90 ${item.status === 'above' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                {item.status === 'above' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Price</p>
                                <p className="text-xl font-black text-gray-900 tracking-tighter">₹{item.myPrice}</p>
                            </div>
                            <div className="p-3 bg-primary-50 rounded-2xl border border-primary-100 group-hover:bg-white transition-colors">
                                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">District Avg</p>
                                <p className="text-xl font-black text-primary-700 tracking-tighter">₹{item.marketAvg}</p>
                            </div>
                        </div>

                        {/* Comparison Indicator */}
                        <div className="relative z-10 space-y-2">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                {item.status === 'above' ? (
                                    <>
                                        <div className="h-full bg-primary-500" style={{ width: '60%' }} />
                                        <div className="h-full bg-orange-500 animate-pulse" style={{ width: '20%' }} />
                                    </>
                                ) : (
                                    <>
                                        <div className="h-full bg-green-500" style={{ width: '80%' }} />
                                    </>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 italic">
                                <Info className="w-3 h-3" />
                                {item.status === 'above'
                                    ? `You are ₹${item.myPrice - item.marketAvg} above average. Adjusting could increase sales by 40%.`
                                    : `Great! You are ₹${item.marketAvg - item.myPrice} below local average. Most competitive in district!`
                                }
                            </p>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketBenchmarking;
