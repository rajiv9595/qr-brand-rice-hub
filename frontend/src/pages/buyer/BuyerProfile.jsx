import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, X, Plus, Search, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import ProfessionalAddressSearch from '../../components/common/ProfessionalAddressSearch';

const BuyerProfile = () => {
    const [user, setUser] = useState(authService.getCurrentUser());

    // State for modals
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch fresh user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authService.getProfile();
                if (res.success) setUser(res.data);
            } catch (err) {
                console.error("Failed to sync profile", err);
            }
        };
        fetchUser();
    }, []);

    // Forms
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });

    const [addressForm, setAddressForm] = useState({
        street: user?.address?.street || '',
        village: user?.address?.village || '',
        city: user?.address?.city || '',
        state: user?.address?.state || 'Andhra Pradesh',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'India'
    });

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    };

    const openAddressModal = () => {
        const currentAddr = user?.address || {};
        setAddressForm({
            street: currentAddr.street || '',
            village: currentAddr.village || '',
            city: currentAddr.city || '',
            state: currentAddr.state || 'Andhra Pradesh',
            zipCode: currentAddr.zipCode || '',
            country: currentAddr.country || 'India'
        });
        setIsEditingAddress(true);
    };

    const submitProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.updateProfile({
                name: profileForm.name,
                phone: profileForm.phone
            });
            if (res.success) {
                // authService.updateProfile already updates localStorage
                setUser(authService.getCurrentUser());
                setIsEditingProfile(false);
            }
        } catch (err) {
            console.error('Failed to update profile', err);
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const submitAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.updateProfile({
                address: addressForm
            });
            if (res.success) {
                setUser(authService.getCurrentUser());
                setIsEditingAddress(false);
            }
        } catch (err) {
            console.error('Failed to update address', err);
            alert(err.response?.data?.message || 'Failed to update address');
        } finally {
            setLoading(false);
        }
    };

    const removeAddress = async () => {
        if (!window.confirm("Are you sure you want to remove your address?")) return;
        setLoading(true);
        try {
            // To remove, we update with empty strings
            const emptyAddress = { street: '', village: '', city: '', state: '', zipCode: '' };
            const res = await authService.updateProfile({
                address: emptyAddress
            });
            if (res.success) {
                // res.data contains the updated user object from the backend
                setUser(res.data);
                // Also update sessionStorage just to be safe
                sessionStorage.setItem('user', JSON.stringify(res.data));

                setAddressForm(prev => ({ ...prev, ...emptyAddress }));
                alert("Address removed successfully");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to remove address');
        } finally {
            setLoading(false);
        }
    };

    const hasAddress = !!(user?.address?.street && user?.address?.city);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <h1 className="text-3xl font-black text-gray-900 mb-6">Profile Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Info Card */}
                <div className="card p-8 bg-white border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[4rem] transition-colors group-hover:bg-primary-100"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                            <span className="text-3xl font-bold text-primary-600">{user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                        <span className="badge badge-primary bg-primary-100 text-primary-700">Verified Customer</span>

                        <div className="mt-8 space-y-4 text-gray-600">
                            <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform delay-75">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium">{user?.phone || 'No phone added'}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="mt-8 px-6 py-2 rounded-full border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors w-full"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Shipping Address Card */}
                <div className="card p-8 bg-white border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-600" /> Default Shipping Address
                    </h3>

                    {hasAddress ? (
                        <div className="bg-gray-50 rounded-xl p-6 space-y-2 border border-gray-100 flex-1">
                            <p className="font-bold text-gray-900">{user?.name}</p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {user.address.street}<br />
                                {user.address.village && <>{user.address.village}, </>}
                                {user.address.city}, {user.address.state} - {user.address.zipCode}
                            </p>
                            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                                <button onClick={openAddressModal} className="text-sm font-bold text-primary-600 hover:text-primary-700">Edit</button>
                                <button onClick={removeAddress} className="text-sm font-bold text-red-500 hover:text-red-600">Remove</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-300 flex-1 flex flex-col items-center justify-center text-center">
                            <MapPin className="w-10 h-10 text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">No address set</p>
                        </div>
                    )}

                    <button
                        onClick={openAddressModal}
                        className="mt-6 w-full btn-secondary text-sm dashed border-2 border-gray-200 hover:border-primary-300 text-gray-400 hover:text-primary-600 transition-colors py-3 flex items-center justify-center gap-2"
                    >
                        {hasAddress ? 'Change Address' : '+ Add New Address'}
                    </button>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Edit Profile</h3>
                            <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={submitProfile} className="space-y-4">
                            <div>
                                <label className="label text-sm font-bold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    className="input w-full bg-gray-50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label text-sm font-bold text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                    className="input w-full bg-gray-50"
                                    placeholder="+91..."
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Address Modal */}
            {isEditingAddress && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary-600" />
                                {hasAddress ? 'Edit Shipping Address' : 'Add New Address'}
                            </h3>
                            <button onClick={() => setIsEditingAddress(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={submitAddress} className="space-y-6">
                            {/* Professional Search Component */}
                            <ProfessionalAddressSearch
                                onSelect={(s) => {
                                    setAddressForm(prev => ({
                                        ...prev,
                                        village: s.village || '',
                                        city: s.city || prev.city,
                                        state: s.state || prev.state,
                                        zipCode: s.pincode || prev.zipCode || ''
                                    }));
                                }}
                                initialValue={addressForm.village}
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street / House Details</label>
                                <textarea
                                    name="street"
                                    value={addressForm.street}
                                    onChange={handleAddressChange}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-gray-700 min-h-[100px] text-sm transition-all"
                                    placeholder="Ex: H.No 4-55, Near Temple, Main Street"
                                    required
                                />
                            </div>

                            {/* Auto-filled Preview Section */}
                            <div className="bg-primary-50/30 rounded-[2rem] p-5 border border-primary-100/50 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-primary-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">Verified Location Details</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none"
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">District / City</label>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none"
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                                        <input
                                            type="text"
                                            value={addressForm.zipCode}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none"
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Village/Town</label>
                                        <input
                                            type="text"
                                            value={addressForm.village}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-primary-700 hover:bg-primary-800 text-white py-5 rounded-2xl shadow-xl shadow-primary-200 transition-all text-[11px] font-black uppercase tracking-[0.2em] mt-2">
                                {loading ? 'Saving to Profile...' : 'Update Primary Address'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerProfile;
