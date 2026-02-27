import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, X, Plus, Search } from 'lucide-react';
import { authService } from '../../services/authService';

const BuyerProfile = () => {
    const [user, setUser] = useState(authService.getCurrentUser());

    // State for modals
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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
                // Also update localStorage just to be safe (authService should have handled it)
                localStorage.setItem('user', JSON.stringify(res.data));

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

                        <form onSubmit={submitAddress} className="space-y-5">
                            {/* Dynamic Search Integration */}
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Search Village / Pincode</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-primary-500" />
                                    <input
                                        type="text"
                                        placeholder="Type Pincode or Village name..."
                                        className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none font-bold text-gray-700 transition-all shadow-inner placeholder:text-gray-400 placeholder:font-medium"
                                        autoComplete="off"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (window.searchTimeout) clearTimeout(window.searchTimeout);

                                            const pincodeMatch = val.match(/^[1-9][0-9]{5}$/);
                                            if (pincodeMatch) {
                                                setIsSearching(true);
                                                window.searchTimeout = setTimeout(() => {
                                                    fetch(`https://api.postalpincode.in/pincode/${val}`)
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            setIsSearching(false);
                                                            if (data && data[0].Status === "Success") {
                                                                const formatted = data[0].PostOffice.slice(0, 8).map(po => ({
                                                                    name: po.Name,
                                                                    district: po.District,
                                                                    state: po.State,
                                                                    pincode: po.Pincode
                                                                }));
                                                                setSuggestions(formatted);
                                                                setShowSuggestions(true);
                                                            } else {
                                                                setSuggestions([]);
                                                                setShowSuggestions(false);
                                                            }
                                                        }).catch(() => { setIsSearching(false); setShowSuggestions(false); });
                                                }, 300);
                                                return;
                                            }

                                            if (val.length === 0) {
                                                setSuggestions([]);
                                                setShowSuggestions(false);
                                                setIsSearching(false);
                                                return;
                                            }

                                            if (val.length > 2) {
                                                setIsSearching(true);
                                                window.searchTimeout = setTimeout(() => {
                                                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&countrycodes=in&limit=6&accept-language=en`;
                                                    fetch(url)
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            setIsSearching(false);
                                                            if (data && data.length > 0) {
                                                                const formatted = data.map(place => {
                                                                    const addr = place.address;
                                                                    return {
                                                                        name: addr.village || addr.suburb || addr.town || addr.city || addr.hamlet || place.display_name.split(',')[0],
                                                                        district: addr.state_district || addr.district || addr.county || '',
                                                                        state: addr.state || '',
                                                                        pincode: addr.postcode || place.display_name.match(/\b\d{6}\b/)?.[0] || ''
                                                                    };
                                                                });
                                                                setSuggestions(formatted);
                                                                setShowSuggestions(true);
                                                            } else {
                                                                setSuggestions([]);
                                                                setShowSuggestions(false);
                                                            }
                                                        }).catch(() => { setIsSearching(false); setShowSuggestions(false); });
                                                }, 300);
                                            } else {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-4 top-4">
                                            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                                        </div>
                                    )}

                                    {/* Dropdown Suggestions */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-2xl border border-gray-100 mt-2 max-h-56 overflow-y-auto z-[110] divide-y divide-gray-50">
                                            {suggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="w-full text-left p-4 hover:bg-primary-50/50 transition-colors flex flex-col items-start gap-1"
                                                    onClick={() => {
                                                        setAddressForm(prev => ({
                                                            ...prev,
                                                            village: s.name || '',
                                                            city: s.district || prev.city,
                                                            state: s.state || prev.state,
                                                            zipCode: s.pincode || prev.zipCode || ''
                                                        }));
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <span className="font-bold text-gray-900 border-b-2 border-primary-100">{s.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                                        {s.district ? s.district + ', ' : ''}{s.state} {s.pincode ? '• ' + s.pincode : ''}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="label text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Street Address</label>
                                <textarea
                                    name="street"
                                    value={addressForm.street}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none font-medium text-sm min-h-[80px]"
                                    placeholder="House No, Building Name, Street, Landmark"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest ml-1">Village / Area</label>
                                <input
                                    type="text"
                                    name="village"
                                    value={addressForm.village}
                                    className="w-full bg-primary-50/30 border border-primary-100/50 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none"
                                    readOnly
                                    placeholder="Select from search above"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest ml-1">City / District</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        className="w-full bg-primary-50/30 border border-primary-100/50 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none"
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest ml-1">Pincode</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={addressForm.zipCode}
                                        onChange={handleAddressChange}
                                        className="w-full bg-primary-50/30 border border-primary-100/50 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-primary-400 uppercase tracking-widest ml-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={addressForm.state}
                                    className="w-full bg-primary-50/30 border border-primary-100/50 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none"
                                    readOnly
                                />
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-primary-700 hover:bg-primary-800 text-white py-4 rounded-2xl shadow-xl shadow-primary-200 transition-all text-sm font-black uppercase tracking-widest mt-4">
                                {loading ? 'Saving to Cloud...' : 'Save Shipping Address'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerProfile;
