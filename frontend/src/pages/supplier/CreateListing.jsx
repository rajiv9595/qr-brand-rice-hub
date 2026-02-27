import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { supplierService } from '../../services/supplierService';

const CreateListing = () => {
    const navigate = useNavigate();
    const { refreshStats } = useOutletContext() || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        brandName: '',
        riceVariety: '',
        pricePerBag: '',
        stockAvailable: '',
        bagWeightKg: '',
        dispatchTimeline: '',
        usageCategory: '',
    });

    const [bagImage, setBagImage] = useState(null);
    const [grainImage, setGrainImage] = useState(null);
    const [bagImagePreview, setBagImagePreview] = useState('');
    const [grainImagePreview, setGrainImagePreview] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const validateForm = () => {
        if (!formData.brandName.trim()) return 'Brand name is required';
        if (!formData.riceVariety.trim()) return 'Rice variety is required';
        if (!formData.pricePerBag || formData.pricePerBag <= 0) return 'Valid price is required';
        if (!formData.stockAvailable || formData.stockAvailable <= 0) return 'Valid stock quantity is required';
        if (!formData.bagWeightKg || formData.bagWeightKg <= 0) return 'Valid bag weight is required';
        if (!formData.dispatchTimeline.trim()) return 'Dispatch timeline is required';
        if (!formData.usageCategory) return 'Usage category is required';
        if (!bagImage) return 'Bag image is required';
        if (!grainImage) return 'Grain image is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            data.append('bagImage', bagImage);
            data.append('grainImage', grainImage);

            await supplierService.createListing(data);
            if (refreshStats) refreshStats();
            setSuccess(true);

            setTimeout(() => {
                navigate('/supplier/listings');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create New Listing</h2>
                <p className="text-gray-600 mt-2">Add a new rice product to the marketplace</p>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-900">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-green-900">Success!</p>
                        <p className="text-sm text-green-700">Listing created successfully. Redirecting...</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="card p-8 space-y-6">
                    <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Brand Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., Premium Basmati Gold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Rice Variety <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="riceVariety"
                                value={formData.riceVariety}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select variety</option>
                                <option value="Sona Masoori">Sona Masoori</option>
                                <option value="Basmati">Basmati</option>
                                <option value="HMT">HMT</option>
                                <option value="BPT">BPT</option>
                                <option value="Jeera Rice">Jeera Rice</option>
                                <option value="Brown Rice">Brown Rice</option>
                                <option value="Idli Rice">Idli Rice</option>
                                <option value="Raw Rice">Raw Rice</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Price per Bag (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="pricePerBag"
                                value={formData.pricePerBag}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., 2500"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Bag Weight (kg) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="bagWeightKg"
                                value={formData.bagWeightKg}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., 25"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Stock Available (bags) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stockAvailable"
                                value={formData.stockAvailable}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., 500"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Dispatch Timeline <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="dispatchTimeline"
                                value={formData.dispatchTimeline}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., 2-3 days"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Usage Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="usageCategory"
                            value={formData.usageCategory}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Select category</option>
                            <option value="Daily Family Use">Daily Family Use</option>
                            <option value="Function/Catering Use">Function/Catering Use</option>
                            <option value="Guests/Special Meal Use">Guests/Special Meal Use</option>
                            <option value="Healthy/Brown Rice">Healthy/Brown Rice</option>
                            <option value="Biryani/Pulao Special">Biryani/Pulao Special</option>
                            <option value="Hotel/Commercial Use">Hotel/Commercial Use</option>
                        </select>
                    </div>
                </div>

                {/* Image Uploads */}
                <div className="card p-8 space-y-6">
                    <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">Product Images</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bag Image */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Bag Image <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'bag')}
                                    className="hidden"
                                    id="bagImage"
                                />
                                <label
                                    htmlFor="bagImage"
                                    className="block aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary-500 transition-all overflow-hidden"
                                >
                                    {bagImagePreview ? (
                                        <img src={bagImagePreview} alt="Bag preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <Upload className="w-12 h-12 mb-2" />
                                            <p className="text-sm font-bold">Upload Bag Image</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Grain Image */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Grain Image <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'grain')}
                                    className="hidden"
                                    id="grainImage"
                                />
                                <label
                                    htmlFor="grainImage"
                                    className="block aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary-500 transition-all overflow-hidden"
                                >
                                    {grainImagePreview ? (
                                        <img src={grainImagePreview} alt="Grain preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <ImageIcon className="w-12 h-12 mb-2" />
                                            <p className="text-sm font-bold">Upload Grain Image</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/supplier/listings')}
                        className="btn-secondary flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateListing;
