import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Upload, IndianRupee, Weight, Truck, Tag, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { riceService } from '../../services'; // For fetching initial data

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        brandName: '',
        riceVariety: '',
        pricePerBag: '',
        stockAvailable: '',
        bagWeightKg: '',
        dispatchTimeline: '',
        usageCategory: ''
    });

    const [bagImage, setBagImage] = useState(null);
    const [grainImage, setGrainImage] = useState(null);
    const [bagImagePreview, setBagImagePreview] = useState(null);
    const [grainImagePreview, setGrainImagePreview] = useState(null);

    // Status State
    const [listingStatus, setListingStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const riceVarieties = [
        'Sona Masoori', 'Basmati', 'HMT', 'BPT', 'Jeera Rice', 'Brown Rice', 'Idli Rice', 'Raw Rice'
    ];

    const usageCategories = [
        'Daily Family Use',
        'Function/Catering Use',
        'Guests/Special Meal Use',
        'Healthy/Brown Rice',
        'Biryani/Pulao Special',
        'Hotel/Commercial Use'
    ];

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await riceService.getRiceById(id);
                const listing = res.data.data;

                setListingStatus(listing.approvalStatus);
                setRejectionReason(listing.rejectionReason);

                setFormData({
                    brandName: listing.brandName,
                    riceVariety: listing.riceVariety,
                    pricePerBag: listing.pricePerBag,
                    stockAvailable: listing.stockAvailable,
                    bagWeightKg: listing.bagWeightKg,
                    dispatchTimeline: listing.dispatchTimeline,
                    usageCategory: listing.usageCategory
                });

                if (listing.bagImageUrl) setBagImagePreview(listing.bagImageUrl);
                if (listing.grainImageUrl) setGrainImagePreview(listing.grainImageUrl);

            } catch (err) {
                setError('Failed to load listing details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'bag') {
                setBagImage(file);
                setBagImagePreview(URL.createObjectURL(file));
            } else {
                setGrainImage(file);
                setGrainImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Only append images if new ones were selected
            if (bagImage) data.append('bagImage', bagImage);
            if (grainImage) data.append('grainImage', grainImage);

            await supplierService.updateListing(id, data);
            setSuccess(true);
            setTimeout(() => {
                navigate('/supplier/listings');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update listing.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <button onClick={() => navigate('/supplier/listings')} className="flex items-center text-gray-500 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to My Listings
            </button>

            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Edit Listing</h2>
                <p className="text-gray-600 mt-2">Update your product details and pricing</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-green-700">Listing updated successfully!</p>
                        <p className="text-xs text-green-600">Redirecting to listings...</p>
                    </div>
                </div>
            )}

            {listingStatus === 'rejected' && rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-red-800">Listing Rejected</h3>
                        <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
                        <p className="text-xs text-red-600 mt-2 font-medium">Please correct the issues and update the listing to resubmit for approval.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="card p-8 space-y-6">
                    <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary-600" />
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Brand Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Rice Variety <span className="text-red-500">*</span></label>
                            <select
                                name="riceVariety"
                                value={formData.riceVariety}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                required
                            >
                                <option value="">Select Variety</option>
                                {riceVarieties.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Price per Bag (₹) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="pricePerBag"
                                    value={formData.pricePerBag}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bag Weight (kg) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Weight className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="bagWeightKg"
                                    value={formData.bagWeightKg}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Stock Available (bags) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Package className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="stockAvailable"
                                    value={formData.stockAvailable}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Dispatch Timeline <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Truck className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="dispatchTimeline"
                                    value={formData.dispatchTimeline}
                                    onChange={handleChange}
                                    placeholder="e.g., 2-3 Days"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Usage Category <span className="text-red-500">*</span></label>
                        <select
                            name="usageCategory"
                            value={formData.usageCategory}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                            required
                        >
                            <option value="">Select Category</option>
                            {usageCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Images (Optional on Edit) */}
                <div className="card p-8 space-y-6">
                    <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary-600" />
                        Product Images
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bag Image */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bag Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors relative bg-gray-50 h-64 flex flex-col items-center justify-center cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'bag')}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {bagImagePreview ? (
                                    <img src={bagImagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Click to upload new image</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grain Image */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Grain Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors relative bg-gray-50 h-64 flex flex-col items-center justify-center cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'grain')}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {grainImagePreview ? (
                                    <img src={grainImagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Click to upload new image</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/supplier/listings')}
                        className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-8 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Update Listing
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;
