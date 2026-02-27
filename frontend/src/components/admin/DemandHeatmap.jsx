import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MapPin, TrendingUp, Search, Layers } from 'lucide-react';

const DemandHeatmap = () => {
    const [heatmap, setHeatmap] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const res = await api.get('/admin/insights/heatmap');
                setHeatmap(res.data.data);
            } catch (err) {
                console.error('Failed to fetch heatmap', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-3xl" />;
    if (heatmap.length === 0) return (
        <div className="card p-12 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">No demand data collected yet.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary-600" />
                        Demand Heatmap
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Top searching locations and varieties</p>
                </div>
                <div className="bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-primary-600" />
                    <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Real-time Analytics</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heatmap.map((item, idx) => (
                    <div key={idx} className="card p-5 hover:shadow-lg transition-all border-0 ring-1 ring-gray-100 group relative overflow-hidden">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary-600 font-black group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{item.district || 'Unknown District'}</p>
                                    <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{item.variety || 'All Varieties'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-gray-900">{item.searchCount}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Searches</p>
                            </div>
                        </div>

                        {/* Visual Progress Bar for Intensity */}
                        <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
                                style={{ width: `${Math.min((item.searchCount / heatmap[0].searchCount) * 100, 100)}%` }}
                            />
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-1/4 -translate-y-1/4">
                            <MapPin className="w-16 h-16 text-primary-600" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DemandHeatmap;
