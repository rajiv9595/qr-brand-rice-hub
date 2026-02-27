import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { riceService } from '../../services/riceService';
import { Search, Plus, Edit2, Trash2, ChefHat, X, Check, AlertCircle } from 'lucide-react';

const CookingTipsManagement = () => {
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [tipsMap, setTipsMap] = useState({}); // listingId -> tipObject
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [currentListing, setCurrentListing] = useState(null);
    const [formData, setFormData] = useState({
        washingMethod: 'Multiple Wash',
        soakingTimeMinutes: 30,
        waterRatio: '1:2',
        cookingMethod: 'Pressure Cooker',
        expectedTexture: 'Fluffy and Separate',
        bestDishes: '',
        notes: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all approved listings
            const listingsRes = await riceService.getPublicListings({ limit: 1000 });

            // Fetch all cooking tips
            const tipsRes = await adminService.getAllCookingTips();

            if (listingsRes.data.success) {
                setListings(listingsRes.data.data);
            }

            if (tipsRes.data.success) {
                // Map tips by riceListingId for O(1) lookup
                const map = {};
                tipsRes.data.data.forEach(tip => {
                    // Start Update: Handle populated riceListingId which is an object
                    const listingId = typeof tip.riceListingId === 'object' ? tip.riceListingId._id : tip.riceListingId;
                    map[listingId] = tip;
                    // End Update
                });
                setTipsMap(map);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            // alert("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (listing, existingTip = null) => {
        setCurrentListing(listing);
        if (existingTip) {
            setIsEditing(true);
            setFormData({
                washingMethod: existingTip.washingMethod,
                soakingTimeMinutes: existingTip.soakingTimeMinutes,
                waterRatio: existingTip.waterRatio,
                cookingMethod: existingTip.cookingMethod,
                expectedTexture: existingTip.expectedTexture,
                bestDishes: existingTip.bestDishes ? existingTip.bestDishes.join(', ') : '',
                notes: existingTip.notes || ''
            });
        } else {
            setIsEditing(false);
            setFormData({
                washingMethod: 'Multiple Wash',
                soakingTimeMinutes: 30,
                waterRatio: '1:2',
                cookingMethod: 'Pressure Cooker',
                expectedTexture: 'Fluffy and Separate',
                bestDishes: '',
                notes: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                ...formData,
                riceListingId: currentListing._id,
                bestDishes: formData.bestDishes.split(',').map(d => d.trim()).filter(d => d)
            };

            if (isEditing) {
                const tipId = tipsMap[currentListing._id]._id;
                await adminService.updateCookingTip(tipId, payload);
            } else {
                await adminService.createCookingTip(payload);
            }

            await fetchData(); // Refresh data
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (listingId) => {
        if (!window.confirm("Are you sure you want to delete these cooking tips?")) return;

        try {
            const tipId = tipsMap[listingId]._id;
            await adminService.deleteCookingTip(tipId);
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to delete tip");
        }
    };

    const filteredListings = listings.filter(l =>
        l.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.riceVariety.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading cooking tips management...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Cooking Tips Management</h1>
                    <p className="text-gray-500 mt-1">Add expert cooking guidance to rice listings</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        className="input-field pl-10 py-2 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredListings.length > 0 ? (
                    filteredListings.map(listing => {
                        const hasTip = !!tipsMap[listing._id];
                        const tip = tipsMap[listing._id];

                        return (
                            <div key={listing._id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-primary-200 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${hasTip ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        <ChefHat size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{listing.brandName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="badge badge-neutral">{listing.riceVariety}</span>
                                            {hasTip ? (
                                                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                    <Check size={12} /> Tips Added
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> Tips Missing
                                                </span>
                                            )}
                                        </div>
                                        {hasTip && (
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                                                By: {tip.createdBy?.name || 'Expert'} • {tip.cookingMethod} • Ratio {tip.waterRatio}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {hasTip ? (
                                        <>
                                            <button
                                                onClick={() => handleOpenModal(listing, tip)}
                                                className="btn-secondary text-sm py-2 px-4 flex-1 md:flex-none"
                                            >
                                                <Edit2 size={16} className="mr-2" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(listing._id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Tips"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleOpenModal(listing)}
                                            className="btn-primary text-sm py-2 px-4 flex-1 md:flex-none shadow-none"
                                        >
                                            <Plus size={16} className="mr-2" /> Add Tips
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p>No listings found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEditing ? 'Edit Cooking Tips' : 'Add Cooking Tips'}
                                </h2>
                                <p className="text-sm text-gray-500">For {currentListing?.brandName} ({currentListing?.riceVariety})</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label text-sm font-bold text-gray-700 mb-1 block">Washing Method</label>
                                    <select
                                        className="input-field"
                                        value={formData.washingMethod}
                                        onChange={e => setFormData({ ...formData, washingMethod: e.target.value })}
                                        required
                                    >
                                        <option value="Light Wash">Light Wash</option>
                                        <option value="Multiple Wash">Multiple Wash</option>
                                        <option value="Soaking Required">Soaking Required</option>
                                        <option value="No Wash Needed">No Wash Needed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-sm font-bold text-gray-700 mb-1 block">Soaking Time (Minutes)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.soakingTimeMinutes}
                                        onChange={e => setFormData({ ...formData, soakingTimeMinutes: Number(e.target.value) })}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label text-sm font-bold text-gray-700 mb-1 block">Water Ratio (Rice:Water)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.waterRatio}
                                        onChange={e => setFormData({ ...formData, waterRatio: e.target.value })}
                                        placeholder="e.g. 1:2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label text-sm font-bold text-gray-700 mb-1 block">Cooking Method</label>
                                    <select
                                        className="input-field"
                                        value={formData.cookingMethod}
                                        onChange={e => setFormData({ ...formData, cookingMethod: e.target.value })}
                                        required
                                    >
                                        <option value="Pressure Cooker">Pressure Cooker</option>
                                        <option value="Open Vessel">Open Vessel</option>
                                        <option value="Electric Cooker">Electric Cooker</option>
                                        <option value="Suitable for All">Suitable for All</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label text-sm font-bold text-gray-700 mb-1 block">Expected Texture</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.expectedTexture}
                                    onChange={e => setFormData({ ...formData, expectedTexture: e.target.value })}
                                    placeholder="e.g. Fluffy, Sticky, Soft..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="label text-sm font-bold text-gray-700 mb-1 block">Best Dishes (Comma separated)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.bestDishes}
                                    onChange={e => setFormData({ ...formData, bestDishes: e.target.value })}
                                    placeholder="e.g. Biryani, Fried Rice, Daily Meal"
                                />
                            </div>

                            <div>
                                <label className="label text-sm font-bold text-gray-700 mb-1 block">Additional Notes</label>
                                <textarea
                                    className="input-field min-h-[100px]"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any generic tips..."
                                ></textarea>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-8"
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? 'Saving...' : 'Save Tips'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CookingTipsManagement;
