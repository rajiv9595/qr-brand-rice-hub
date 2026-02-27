import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BarChart2, Plus, X, ArrowRight, ShoppingCart } from 'lucide-react';
import { riceService } from '../services';

const ComparePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listingIds, setListingIds] = useState(searchParams.get('ids')?.split(',') || []);
    const [comparisonData, setComparisonData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchComparison = async () => {
            if (listingIds.length < 2) {
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
        setSearchParams({ ids: newList.join(',') });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <BarChart2 className="w-8 h-8 text-primary-600" /> Brand Comparison
                    </h1>
                    <p className="text-gray-500 font-medium">Analyze specifications side-by-side (2-4 brands)</p>
                </div>
            </div>

            {listingIds.length < 2 ? (
                <div className="card p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                        <Plus className="w-10 h-10 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Start a Comparison</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">Visit the search page and select brands you want to compare side-by-side.</p>
                    <Link to="/search" className="btn-primary inline-block">Go to Search</Link>
                </div>
            ) : (
                <div className="overflow-x-auto pb-8">
                    <table className="w-full min-w-[600px] border-separate border-spacing-x-4">
                        <thead>
                            <tr>
                                <th className="w-48 text-left py-4"></th>
                                {comparisonData.map(item => (
                                    <th key={item.id} className="relative align-top group min-w-[200px]">
                                        <div className="card p-4 relative h-full">
                                            <button
                                                onClick={() => removeListing(item.id)}
                                                className="absolute -top-2 -right-2 bg-white shadow-md border border-gray-100 rounded-full p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden p-4">
                                                <img src={`https://via.placeholder.com/200?text=${item.brandName}`} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 leading-none mb-1">{item.brandName}</h3>
                                            <p className="text-xs font-bold text-gray-400">{item.riceVariety}</p>
                                        </div>
                                    </th>
                                ))}
                                {comparisonData.length < 4 && (
                                    <th className="align-top">
                                        <Link to="/search" className="card h-full flex flex-col items-center justify-center p-8 border-dashed bg-gray-50 text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all">
                                            <Plus className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Add Brand</span>
                                        </Link>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-center font-bold text-gray-700">
                            <tr className="bg-white">
                                <td className="text-left py-6 px-4 first:rounded-l-2xl border-y border-l border-gray-100 bg-gray-50/50 text-xs font-black uppercase text-gray-400">Price (₹)</td>
                                {comparisonData.map(item => (
                                    <td key={item.id} className="py-6 border-y border-gray-100 text-2xl text-primary-700 tracking-tighter">₹{item.pricePerBag}</td>
                                ))}
                                {comparisonData.length < 4 && <td className="bg-transparent border-none"></td>}
                            </tr>
                            <tr className="bg-white">
                                <td className="text-left py-6 px-4 first:rounded-l-2xl border-y border-l border-gray-100 bg-gray-50/50 text-xs font-black uppercase text-gray-400">Weight</td>
                                {comparisonData.map(item => (
                                    <td key={item.id} className="py-6 border-y border-gray-100">{item.bagWeightKg} kg Bag</td>
                                ))}
                                {comparisonData.length < 4 && <td className="bg-transparent border-none"></td>}
                            </tr>
                            <tr className="bg-white">
                                <td className="text-left py-6 px-4 first:rounded-l-2xl border-y border-l border-gray-100 bg-gray-50/50 text-xs font-black uppercase text-gray-400">Recommended Use</td>
                                {comparisonData.map(item => (
                                    <td key={item.id} className="py-6 border-y border-gray-100 text-sm">{item.usageCategory}</td>
                                ))}
                                {comparisonData.length < 4 && <td className="bg-transparent border-none"></td>}
                            </tr>
                            <tr className="bg-white">
                                <td className="text-left py-6 px-4 first:rounded-l-2xl border-y border-l border-gray-100 bg-gray-50/50 text-xs font-black uppercase text-gray-400">Source Mill</td>
                                {comparisonData.map(item => (
                                    <td key={item.id} className="py-6 border-y border-gray-100">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm">{item.supplier.millName}</span>
                                            <span className="text-[10px] text-gray-400">{item.supplier.district}, {item.supplier.state}</span>
                                        </div>
                                    </td>
                                ))}
                                {comparisonData.length < 4 && <td className="bg-transparent border-none"></td>}
                            </tr>
                            <tr>
                                <td className="border-none"></td>
                                {comparisonData.map(item => (
                                    <td key={item.id} className="py-8">
                                        <Link to={`/rice/${item.id}`} className="btn-primary w-full text-center py-4 flex items-center justify-center gap-2">
                                            Details <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                ))}
                                {comparisonData.length < 4 && <td className="bg-transparent border-none"></td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ComparePage;
