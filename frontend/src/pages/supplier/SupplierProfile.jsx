import React, { useState, useEffect } from 'react';
import { Save, User, MapPin, Building2, FileText, CheckCircle, AlertCircle, Edit3, X, Landmark, Wallet, CreditCard } from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { authService } from '../../services/authService';
import { indianStatesAndDistricts } from '../../data/indianStates';

const SupplierProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const [formData, setFormData] = useState({
        millName: '',
        gstNumber: '',
        gstRegistrationYears: '',
        address: '',
        district: '',
        state: '',
        phone: '',
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            branchName: ''
        },
        upiId: ''
    });

    const fetchProfile = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);

            const res = await supplierService.getProfile();
            if (res.data.success && res.data.data) {
                setProfileData(res.data.data);

                // Use fresh user data from backend if available (includes updated isVerified status)
                if (res.data.data.userId && typeof res.data.data.userId === 'object') {
                    setUser(res.data.data.userId);
                }

                const {
                    millName, gstNumber, gstRegistrationYears,
                    address, district, state, userId, bankDetails, upiId
                } = res.data.data;

                setFormData({
                    millName: millName || '',
                    gstNumber: gstNumber || '',
                    gstRegistrationYears: gstRegistrationYears || '',
                    address: address || '',
                    district: district || '',
                    state: state || '',
                    phone: userId?.phone || '',
                    bankDetails: {
                        accountHolderName: bankDetails?.accountHolderName || '',
                        accountNumber: bankDetails?.accountNumber || '',
                        bankName: bankDetails?.bankName || '',
                        ifscCode: bankDetails?.ifscCode || '',
                        branchName: bankDetails?.branchName || ''
                    },
                    upiId: upiId || ''
                });
            }
        } catch (err) {
            if (err.response && err.response.status !== 404) {
                setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
            } else {
                // If 404, default to edit mode for first time setup
                setIsEditing(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            let updatedFormData = { ...formData, [name]: value };

            // If State changes, clear district
            if (name === 'state') {
                updatedFormData.district = '';
            }

            setFormData(updatedFormData);
        }
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await supplierService.updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
            setIsEditing(false);
            fetchProfile(); // Refetch to update view
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // View Mode Component
    const ProfileView = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / ID Card */}
            <div className="card p-0 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-start -mt-12 mb-6 gap-6">
                        <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl shrink-0">
                            <div className="w-full h-full bg-primary-50 rounded-xl flex items-center justify-center border border-gray-100">
                                <Building2 className="w-10 h-10 text-primary-600" />
                            </div>
                        </div>
                        <div className="flex-1 md:mt-16">
                            <h2 className="text-3xl font-display font-bold text-gray-900">
                                {profileData?.millName || 'Unregistered Mill'}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{profileData?.district || 'Unknown District'}, {profileData?.state || 'Unknown State'}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 md:mt-16">
                            {user?.isVerified ? (
                                <span className="badge badge-success px-4 py-2">
                                    <CheckCircle className="w-4 h-4" /> Verified Supplier
                                </span>
                            ) : user?.autoActivateAt && new Date(user.autoActivateAt) > new Date() ? (
                                <span className="badge bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 animate-pulse">
                                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                    Activating Automatically...
                                </span>
                            ) : (
                                <span className="badge badge-warning px-4 py-2">
                                    <AlertCircle className="w-4 h-4" /> Verification Pending
                                </span>
                            )}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-t border-gray-100">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">GST Number</p>
                            <p className="font-mono font-bold text-gray-900 text-lg">{profileData?.gstNumber || 'Not Provided'}</p>
                            {profileData?.gstRegistrationYears && (
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-1">
                                    Registered for {profileData.gstRegistrationYears} years
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Email</p>
                            <p className="font-medium text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                            <p className="font-medium text-gray-900">{user?.phone || 'Not Provided'}</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Full Address</p>
                        <p className="text-gray-700 leading-relaxed">{profileData?.address || 'No address provided'}</p>
                    </div>

                    {/* Bank & Payment Specs */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-primary-600" />
                            Bank & Payment Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Holder</p>
                                <p className="font-bold text-gray-800">{profileData?.bankDetails?.accountHolderName || 'Not Set'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
                                <p className="font-mono font-bold text-gray-800 tracking-wider">
                                    {profileData?.bankDetails?.accountNumber ? `•••• ${profileData.bankDetails.accountNumber.slice(-4)}` : 'Not Set'}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank & Branch</p>
                                <p className="font-bold text-gray-800">{profileData?.bankDetails?.bankName || 'Not Set'}</p>
                                {profileData?.bankDetails?.branchName && (
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{profileData.bankDetails.branchName}</p>
                                )}
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">IFSC Code</p>
                                <p className="font-mono font-bold text-gray-800">{profileData?.bankDetails?.ifscCode || 'Not Set'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm md:col-span-2 lg:col-span-1 border-dashed bg-primary-50/30">
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Wallet className="w-3 h-3" /> UPI ID
                                </p>
                                <p className="font-bold text-primary-700">{profileData?.upiId || 'Not Set'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Profile Settings</h2>
                <p className="text-gray-600 mt-2">Manage your business identity and verification details</p>
            </div>

            {/* Notification */}
            {message.text && (
                <div className={`border rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                    {message.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5" /> : <CheckCircle className="w-5 h-5 mt-0.5" />}
                    <div>
                        <p className="font-bold">{message.type === 'error' ? 'Error' : 'Success'}</p>
                        <p className="text-sm">{message.text}</p>
                    </div>
                </div>
            )}

            {isEditing ? (
                <div className="card p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Edit Business Details</h3>
                            <p className="text-sm text-gray-500">Update your mill information and location</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Form Sections (Reused Logic) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mill / Company Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text" name="millName" value={formData.millName} onChange={handleChange} required
                                        className="input-field pl-12" placeholder="e.g., Sri Ram Rice Mill"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">GST Number</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                                            className="input-field pl-12" placeholder="e.g., 29ABCDE1234F1Z5"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Years of GST registration</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 flex items-center justify-center w-5 h-5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Yrs</span>
                                        </div>
                                        <input
                                            type="number" name="gstRegistrationYears" value={formData.gstRegistrationYears} onChange={handleChange}
                                            className="input-field pl-12" placeholder="e.g., 12" min="0"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1 font-bold uppercase tracking-tight italic">
                                        Tip: ≥ 10 years enables automatic account activation in 2 minutes.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        className="input-field pl-12" placeholder="e.g., 9876543210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">State <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        list="states-list"
                                        className="input-field"
                                        placeholder="Type or select state..."
                                        autoComplete="off"
                                    />
                                    <datalist id="states-list">
                                        {Object.keys(indianStatesAndDistricts).map((state) => (
                                            <option key={state} value={state} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">District <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.state}
                                        list="districts-list"
                                        className={`input-field ${!formData.state ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder={formData.state ? "Type or select district..." : "Select State first"}
                                        autoComplete="off"
                                    />
                                    <datalist id="districts-list">
                                        {formData.state && indianStatesAndDistricts[formData.state]?.map((district) => (
                                            <option key={district} value={district} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <textarea
                                        name="address" value={formData.address} onChange={handleChange} required rows="3"
                                        className="input-field pl-12 resize-none" placeholder="Door No, Street, Area..."
                                    />
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            <div className="col-span-1 md:col-span-2 pt-6 border-t border-gray-100">
                                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-primary-600" />
                                    Bank & Payment Verification
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Account Holder Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text" name="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange}
                                                className="input-field pl-12 bg-gray-50/50" placeholder="Proper name as per bank"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Bank Account Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange}
                                                className="input-field pl-12 bg-gray-50/50" placeholder="e.g., 50100012345678"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Bank Name</label>
                                        <input
                                            type="text" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange}
                                            className="input-field bg-gray-50/50" placeholder="e.g., HDFC Bank"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">IFSC Code</label>
                                            <input
                                                type="text" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange}
                                                className="input-field bg-gray-50/50 font-mono uppercase" placeholder="HDFC0001234"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Branch</label>
                                            <input
                                                type="text" name="bankDetails.branchName" value={formData.bankDetails.branchName} onChange={handleChange}
                                                className="input-field bg-gray-50/50" placeholder="Main Branch"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2 ml-1">UPI ID for Payments</label>
                                        <div className="relative">
                                            <Wallet className="absolute left-4 top-3.5 w-4 h-4 text-primary-400" />
                                            <input
                                                type="text" name="upiId" value={formData.upiId} onChange={handleChange}
                                                className="input-field pl-12 border-primary-100 bg-primary-50/10 focus:border-primary-500" placeholder="e.g., mobile-number@upi or millname@bank"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 ml-1 italic font-bold">
                                            Note: These details will be shown to buyers after order confirmation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <ProfileView />
            )}
        </div>
    );
};

export default SupplierProfile;
