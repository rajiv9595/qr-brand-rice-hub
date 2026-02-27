import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ExpertReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllExpertReviews();
            setReviews(res.data.reviews || []);
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
                await adminService.createExpertReview(modal.data);
            } else {
                await adminService.updateExpertReview(modal.data._id, modal.data);
            }
            setModal({ open: false, mode: 'create', data: null });
            fetchReviews();
        } catch (err) {
            alert('Failed to save expert review');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this expert review?')) return;
        try {
            await adminService.deleteExpertReview(id);
            fetchReviews();
        } catch (err) {
            alert('Failed to delete expert review');
        }
    };

    const openCreateModal = () => {
        setModal({
            open: true,
            mode: 'create',
            data: {
                listingId: '',
                expertName: '',
                grainQualityGrade: '',
                suitabilityScore: 5,
                priceFairnessScore: 5,
                expertNotes: '',
                finalRecommendation: ''
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Expert Review Management</h2>
                    <p className="text-gray-600 mt-2">Create and manage expert quality assessments</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Review
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
                    {reviews.map((review) => (
                        <div key={review._id} className="card p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-900 mb-1">
                                        {review.listingId?.brandName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Expert: <span className="font-bold">{review.expertName}</span>
                                    </p>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-black">
                                            Grade: {review.grainQualityGrade}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Suitability: {review.suitabilityScore}/5
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Price Fairness: {review.priceFairnessScore}/5
                                        </span>
                                    </div>
                                    <p className="text-gray-700 italic mb-2">"{review.finalRecommendation}"</p>
                                    <p className="text-sm text-gray-600">{review.expertNotes}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setModal({ open: true, mode: 'edit', data: review })}
                                        className="btn-secondary text-sm py-2 px-3"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review._id)}
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
                            {modal.mode === 'create' ? 'Create' : 'Edit'} Expert Review
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Expert Name</label>
                                    <input
                                        type="text"
                                        value={modal.data.expertName}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, expertName: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Grain Quality Grade</label>
                                    <input
                                        type="text"
                                        value={modal.data.grainQualityGrade}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, grainQualityGrade: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="e.g., A+, Premium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Suitability Score (1-5)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={modal.data.suitabilityScore}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, suitabilityScore: parseInt(e.target.value) } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Final Recommendation</label>
                                    <input
                                        type="text"
                                        value={modal.data.finalRecommendation}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, finalRecommendation: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Expert Notes</label>
                                    <textarea
                                        value={modal.data.expertNotes}
                                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, expertNotes: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                        rows="4"
                                        required
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
                                    {modal.mode === 'create' ? 'Create' : 'Update'} Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertReviewManagement;
