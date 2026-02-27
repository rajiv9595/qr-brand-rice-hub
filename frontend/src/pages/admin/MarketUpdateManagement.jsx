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
            if (modal.mode === 'create') {
                await adminService.createMarketUpdate(modal.data);
            } else {
                await adminService.updateMarketUpdate(modal.data._id, modal.data);
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
                category: 'Trend Update',
                title: '',
                description: '',
                district: '',
                state: '',
                priorityFlag: false
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full my-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">
                            {modal.mode === 'create' ? 'Create' : 'Edit'} Market Update
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={modal.data.category}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    >
                                        <option value="Trend Update">Trend Update</option>
                                        <option value="Price Movement">Price Movement</option>
                                        <option value="Supply Alert">Supply Alert</option>
                                        <option value="Quality Awareness">Quality Awareness</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={modal.data.priorityFlag}
                                            onChange={(e) => setModal({ ...modal, data: { ...modal.data, priorityFlag: e.target.checked } })}
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-bold text-gray-700">Mark as Urgent</span>
                                    </label>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={modal.data.title}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={modal.data.description}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                                    <input
                                        type="text"
                                        value={modal.data.district}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, district: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={modal.data.state}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, state: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: false, mode: 'create', data: null })}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {modal.mode === 'create' ? 'Create' : 'Update'} Update
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
