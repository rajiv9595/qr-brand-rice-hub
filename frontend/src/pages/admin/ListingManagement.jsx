import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, EyeOff, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const ListingManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectModal, setRejectModal] = useState({ open: false, listingId: null, feedback: '' });
    const [deleteModal, setDeleteModal] = useState({ open: false, listingId: null, brandName: '' });
    const [detailModal, setDetailModal] = useState({ open: false, listing: null });

    useEffect(() => {
        fetchListings();
    }, [activeTab, searchTerm]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllListings({
                status: activeTab,
                search: searchTerm
            });
            setListings(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Approve this listing?')) return;
        try {
            await adminService.approveListing(id);
            fetchListings();
        } catch (err) {
            alert('Failed to approve listing');
        }
    };

    const handleReject = async () => {
        if (!rejectModal.feedback.trim()) {
            alert('Please provide rejection feedback');
            return;
        }
        try {
            await adminService.rejectListing(rejectModal.listingId, rejectModal.feedback);
            setRejectModal({ open: false, listingId: null, feedback: '' });
            fetchListings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject listing');
        }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Deactivate this listing?')) return;
        try {
            await adminService.deactivateListing(id);
            fetchListings();
        } catch (err) {
            alert('Failed to deactivate listing');
        }
    };

    const handleActivate = async (id) => {
        if (!confirm('Activate this listing again?')) return;
        try {
            await adminService.activateListing(id);
            fetchListings();
        } catch (err) {
            alert('Failed to activate listing');
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await adminService.deleteListing(deleteModal.listingId);
            setDeleteModal({ open: false, listingId: null, brandName: '' });
            fetchListings();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to permanently delete listing');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'pending', label: 'Pending', color: 'yellow' },
        { key: 'approved', label: 'Approved', color: 'green' },
        { key: 'rejected', label: 'Rejected', color: 'red' },
        { key: 'deactivated', label: 'Deactivated', color: 'gray' },
    ];

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Listing Management</h2>
                    <p className="text-gray-600 mt-2">Review and manage rice listings</p>
                </div>
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search listings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-gray-900 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Listings Table */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <div className="card p-20 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No listings found</h3>
                    <p className="text-gray-500 mt-2">No {activeTab} listings at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing) => (
                        <div key={listing._id} className="card p-6 hover:shadow-lg transition-all">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full lg:w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
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

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                                            <p className="font-bold text-gray-900">{listing.stockAvailable} bags</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Supplier</p>
                                            <p className="font-bold text-gray-900 truncate">{listing.supplierId?.millName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Location</p>
                                            <p className="font-bold text-gray-900 truncate">{listing.supplierId?.district}</p>
                                        </div>
                                    </div>

                                    {listing.adminFeedback && (
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                            <p className="text-xs font-bold text-red-900 mb-1">Admin Feedback:</p>
                                            <p className="text-sm text-red-700">{listing.adminFeedback}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            onClick={() => setDetailModal({ open: true, listing })}
                                            className="btn-secondary text-sm py-2 px-4"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Details
                                        </button>

                                        {activeTab === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(listing._id)}
                                                    className="btn text-sm py-2 px-4 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ open: true, listingId: listing._id, feedback: '' })}
                                                    className="btn text-sm py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {activeTab === 'approved' && (
                                            <button
                                                onClick={() => handleDeactivate(listing._id)}
                                                className="btn text-sm py-2 px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                                            >
                                                <EyeOff className="w-4 h-4 mr-1" />
                                                Deactivate
                                            </button>
                                        )}

                                        {activeTab === 'deactivated' && (
                                            <button
                                                onClick={() => handleActivate(listing._id)}
                                                className="btn text-sm py-2 px-4 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Activate
                                            </button>
                                        )}

                                        {(activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'deactivated') && (
                                            <button
                                                onClick={() => setDeleteModal({ open: true, listingId: listing._id, brandName: listing.brandName })}
                                                className="btn text-sm py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                title="Delete Permanently"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Permanent Delete</h3>
                        <p className="text-gray-500 text-center mb-6 px-4">
                            Are you absolutely sure you want to permanently delete <span className="font-black text-gray-900">"{deleteModal.brandName}"</span>?
                            This action will remove the listing and its images from our cloud servers and cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteModal({ open: false, listingId: null, brandName: '' })}
                                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                {loading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-black text-gray-900 mb-4">Reject Listing</h3>
                        <p className="text-gray-600 mb-6">Please provide feedback for the supplier:</p>
                        <textarea
                            value={rejectModal.feedback}
                            onChange={(e) => setRejectModal({ ...rejectModal, feedback: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows="4"
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setRejectModal({ open: false, listingId: null, feedback: '' })}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                            >
                                Reject Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.open && detailModal.listing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full my-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Listing Details</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Brand Name</p>
                                    <p className="text-lg font-bold text-gray-900">{detailModal.listing.brandName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Rice Variety</p>
                                    <p className="text-lg font-bold text-gray-900">{detailModal.listing.riceVariety}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Price</p>
                                    <p className="text-lg font-bold text-primary-700">₹{detailModal.listing.pricePerBag}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Weight</p>
                                    <p className="text-lg font-bold text-gray-900">{detailModal.listing.bagWeightKg} kg</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Stock</p>
                                    <p className="text-lg font-bold text-gray-900">{detailModal.listing.stockAvailable} bags</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase">Usage Category</p>
                                    <p className="text-lg font-bold text-gray-900">{detailModal.listing.usageCategory}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <img
                                    src={detailModal.listing.bagImageUrl}
                                    alt="Bag"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                                <img
                                    src={detailModal.listing.grainImageUrl}
                                    alt="Grain"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setDetailModal({ open: false, listing: null })}
                            className="btn-primary w-full mt-6"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingManagement;
