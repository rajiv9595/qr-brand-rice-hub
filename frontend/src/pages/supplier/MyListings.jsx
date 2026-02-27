import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, EyeOff, Package, AlertCircle, Pencil, Check, X, Trash2 } from 'lucide-react';
import { supplierService } from '../../services/supplierService';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Stock Edit State
    const [editingStockId, setEditingStockId] = useState(null);
    const [newStockValue, setNewStockValue] = useState('');

    // Delete Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const startStockEdit = (listing) => {
        setEditingStockId(listing._id);
        setNewStockValue(listing.stockAvailable);
    };

    const cancelStockEdit = () => {
        setEditingStockId(null);
        setNewStockValue('');
    };

    const saveStockEdit = async (id) => {
        try {
            await supplierService.updateStock(id, newStockValue);
            setEditingStockId(null);
            fetchListings(); // Refresh list/UI
        } catch (err) {
            console.error(err);
            alert('Failed to update stock. ' + (err.response?.data?.message || ''));
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const res = await supplierService.getMyListings();
            setListings(res.data.data || []);
        } catch (err) {
            setError('Failed to load listings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Are you sure you want to deactivate this listing?')) return;

        try {
            await supplierService.deactivateListing(id);
            fetchListings();
        } catch (err) {
            alert('Failed to deactivate listing');
        }
    };

    const handleActivate = async (id) => {
        if (!confirm('Are you sure you want to activate this listing?')) return;

        try {
            await supplierService.activateListing(id);
            fetchListings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to activate listing');
        }
    };

    const confirmDelete = (listing) => {
        setListingToDelete(listing);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!listingToDelete) return;

        setIsDeleting(true);
        try {
            await supplierService.deleteListing(listingToDelete._id);
            setShowDeleteModal(false);
            setListingToDelete(null);
            fetchListings();
        } catch (err) {
            alert('Failed to delete listing. ' + (err.response?.data?.message || ''));
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Listings</h2>
                    <p className="text-gray-600 mt-2">Manage all your rice products</p>
                </div>
                <Link to="/supplier/create" className="btn-primary">
                    <Package className="w-5 h-5 mr-2" />
                    Create New
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {listings.length === 0 ? (
                <div className="card p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No listings yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Create your first rice listing to start selling on the marketplace.</p>
                    <Link to="/supplier/create" className="btn-primary inline-block">
                        Create First Listing
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing) => (
                        <div key={listing._id} className="card p-6 hover:shadow-lg transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full md:w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                                    <img
                                        src={listing.bagImageUrl || 'https://via.placeholder.com/200?text=Rice'}
                                        alt={listing.brandName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-black text-gray-900 truncate">{listing.brandName}</h3>
                                            <p className="text-sm font-medium text-gray-500">{listing.riceVariety}</p>
                                        </div>
                                        {getStatusBadge(listing.approvalStatus)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 font-medium">Price</p>
                                            <p className="font-black text-primary-700">₹{listing.pricePerBag}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Weight</p>
                                            <p className="font-bold text-gray-900">{listing.bagWeightKg} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Stock</p>

                                            {editingStockId === listing._id ? (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={newStockValue}
                                                        onChange={(e) => setNewStockValue(e.target.value)}
                                                        className="w-16 px-1 py-0.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => saveStockEdit(listing._id)}
                                                        className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                        title="Save"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={cancelStockEdit}
                                                        className="p-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{listing.stockAvailable} bags</p>
                                                    <button
                                                        onClick={() => startStockEdit(listing)}
                                                        className="text-gray-400 hover:text-primary-600 transition-all p-1 hover:bg-gray-100 rounded-full"
                                                        title="Update Stock"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Status</p>
                                            <p className={`font-bold ${listing.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                {listing.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>

                                    {listing.rejectionReason && listing.approvalStatus === 'rejected' && (
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                            <p className="text-xs font-bold text-red-900 mb-1">Admin Feedback:</p>
                                            <p className="text-sm text-red-700">{listing.rejectionReason}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Link
                                            to={`/rice/${listing._id}`}
                                            className="btn-secondary text-sm py-2 px-4"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Link>

                                        {(listing.approvalStatus === 'pending' || listing.approvalStatus === 'rejected') && (
                                            <Link
                                                to={`/supplier/edit/${listing._id}`}
                                                className="btn-secondary text-sm py-2 px-4"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Link>
                                        )}

                                        {listing.isActive ? (
                                            <button
                                                onClick={() => handleDeactivate(listing._id)}
                                                className="btn text-sm py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                            >
                                                <EyeOff className="w-4 h-4 mr-1" />
                                                Deactivate
                                            </button>
                                        ) : listing.approvalStatus === 'approved' && (
                                            <button
                                                onClick={() => handleActivate(listing._id)}
                                                className="btn text-sm py-2 px-4 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Activate
                                            </button>
                                        )}

                                        <button
                                            onClick={() => confirmDelete(listing)}
                                            className="btn text-sm py-2 px-4 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all ml-auto"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 leading-tight">Permanent Removal?</h3>

                            <div className="space-y-3">
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    You are about to <span className="text-red-600 font-bold underline">permanently delete</span>
                                    <span className="block text-gray-900 font-black mt-1">"{listingToDelete?.brandName}"</span>
                                </p>
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 text-left flex gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                                    <p>This action cannot be undone. All data, images, and reviews associated with this listing will be wiped from our database and cloud storage.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all disabled:opacity-50"
                                >
                                    No, Keep it
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Removing...
                                        </>
                                    ) : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListings;
