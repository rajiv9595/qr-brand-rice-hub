import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Bell } from 'lucide-react';
import { adminService } from '../../services/adminService';

const MarketUpdateManagement = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllMarketUpdates();
            setUpdates(res.data.updates || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(modal.data).forEach(key => {
                if (key !== 'image' || modal.data.image) {
                    formData.append(key, modal.data[key]);
                }
            });

            if (modal.mode === 'create') {
                await adminService.createMarketUpdate(formData);
            } else {
                await adminService.updateMarketUpdate(modal.data._id, formData);
            }
            setModal({ open: false, mode: 'create', data: null });
            fetchUpdates();
        } catch (err) {
            alert('Failed to save market update');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this market update?')) return;
        try {
            await adminService.deleteMarketUpdate(id);
            fetchUpdates();
        } catch (err) {
            alert('Failed to delete market update');
        }
    };

    const handleTogglePriority = async (id) => {
        try {
            await adminService.togglePriority(id);
            fetchUpdates();
        } catch (err) {
            alert('Failed to toggle priority');
        }
    };

    const openCreateModal = () => {
        setModal({
            open: true,
            mode: 'create',
            data: {
                category: 'Market Trends',
                title: '',
                description: '',
                district: '',
                state: '',
                priorityFlag: false,
                image: null // For the uploaded file
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Market Update Management</h2>
                    <p className="text-gray-600 mt-2">Create and manage market intelligence updates</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Update
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {updates.map((update) => (
                        <div key={update._id} className={`card p-6 hover:shadow-lg transition-all ${update.priorityFlag ? 'border-l-4 border-l-red-500' : ''
                            }`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-black uppercase">
                                            {update.category}
                                        </span>
                                        {update.priorityFlag && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                <Bell className="w-3 h-3" />
                                                URGENT
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {new Date(update.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">{update.title}</h3>

                                    {update.imageUrl && (
                                        <div className="mb-4 mt-2">
                                            <img
                                                src={update.imageUrl}
                                                alt={update.title}
                                                className="w-full max-h-48 object-cover rounded-xl"
                                            />
                                        </div>
                                    )}

                                    <p className="text-gray-700 mb-3">{update.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Location: <span className="font-bold">{update.district}, {update.state}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleTogglePriority(update._id)}
                                        className={`btn text-sm py-2 px-3 ${update.priorityFlag
                                            ? 'bg-red-50 text-red-600 border-red-200'
                                            : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                            } hover:opacity-80 border`}
                                    >
                                        <Bell className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setModal({ open: true, mode: 'edit', data: update })}
                                        className="btn-secondary text-sm py-2 px-3"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(update._id)}
                                        className="btn text-sm py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {modal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-3xl w-full my-8 shadow-2xl relative">
                        {/* Close button */}
                        <button
                            onClick={() => setModal({ open: false, mode: 'create', data: null })}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-8">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                                {modal.mode === 'create' ? 'Write New Market Update' : 'Edit Market Update'}
                            </h3>
                            <p className="text-gray-500 mt-2">Publish an intelligence article or alert to the Knowledge Hub.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">

                                {/* Full width title */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rice Market Trends: February 2026 Update"
                                        value={modal.data.title}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })}
                                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-field-500 focus:ring-4 focus:ring-field-500/10 outline-none text-lg font-bold text-gray-900 transition-all"
                                        required
                                    />
                                </div>

                                {/* Category & Priority */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <select
                                            value={modal.data.category}
                                            onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}
                                            className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-field-500 focus:ring-4 focus:ring-field-500/10 outline-none font-medium text-gray-700 transition-all appearance-none"
                                            required
                                        >
                                            <option value="Education">🎓 Education</option>
                                            <option value="Quality">⭐ Quality</option>
                                            <option value="Market Trends">📈 Market Trends</option>
                                            <option value="Price Alerts">💹 Price Alerts</option>
                                            <option value="Supply Updates">🚚 Supply Updates</option>
                                        </select>
                                    </div>

                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={modal.data.priorityFlag}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, priorityFlag: e.target.checked } })}
                                                className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                                            />
                                            <div>
                                                <span className="text-sm font-black text-red-800 uppercase tracking-wider block">Mark as Urgent Alert</span>
                                                <span className="text-xs text-red-600 block mt-0.5">Highlights this post with a red border</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Image Upload Component */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image (Optional)</label>
                                    {modal.mode === 'edit' && modal.data.imageUrl && !modal.data.image && (
                                        <div className="mb-3 relative rounded-xl overflow-hidden h-24 border border-gray-200">
                                            <img src={modal.data.imageUrl} alt="Current cover" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Current Image</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-field-400 transition-all relative overflow-hidden">
                                            {modal.data.image ? (
                                                <div className="absolute inset-0">
                                                    <img
                                                        src={URL.createObjectURL(modal.data.image)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover opacity-50"
                                                    />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="bg-black/80 text-white font-bold px-3 py-1.5 rounded-lg text-sm truncate max-w-[80%] border border-gray-600">
                                                            {modal.data.image.name}
                                                        </span>
                                                        <span className="text-xs text-white/90 mt-2 bg-black/50 px-2 py-0.5 rounded">Click to change</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                                    <p className="mb-1 text-sm font-bold text-gray-600">Click to upload image</p>
                                                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, image: e.target.files[0] } })}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Article Body</label>
                                    <textarea
                                        placeholder="Write your market update or tips down here. Be clear and descriptive..."
                                        value={modal.data.description}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-field-500 focus:ring-4 focus:ring-field-500/10 outline-none resize-y min-h-[160px] text-gray-700 leading-relaxed transition-all"
                                        rows="6"
                                        required
                                    />
                                </div>

                                {/* Location Metadata */}
                                <div className="col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Location Tags (Optional)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5">District</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. East Godavari"
                                                value={modal.data.district}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, district: e.target.value } })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-field-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5">State</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Andhra Pradesh"
                                                value={modal.data.state}
                                                onChange={(e) => setModal({ ...modal, data: { ...modal.data, state: e.target.value } })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-field-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: false, mode: 'create', data: null })}
                                    className="px-6 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary py-3.5 text-lg shadow-xl shadow-field-500/20"
                                >
                                    {modal.mode === 'create' ? 'Publish Update' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketUpdateManagement;
