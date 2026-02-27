import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Loader2, CheckCircle2, AlertCircle, Home } from 'lucide-react';

/**
 * Professional Address Search Component
 * Integrates India Post (Pincode) and OSM (Search) with a premium UI.
 */
const ProfessionalAddressSearch = ({ onSelect, initialValue = '' }) => {
    const [query, setQuery] = useState(initialValue);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState(null);
    const searchTimeout = useRef(null);

    const handleSearch = async (val) => {
        setQuery(val);
        setError(null);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (!val || val.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                let results = [];

                // If it looks like a pincode (6 digits)
                if (/^[1-9][0-9]{5}$/.test(val)) {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${val}`);
                    const data = await response.json();

                    if (data && data[0].Status === "Success") {
                        results = data[0].PostOffice.map(po => ({
                            name: po.Name,
                            subtext: `${po.District}, ${po.State}`,
                            village: po.Name,
                            city: po.District,
                            state: po.State,
                            pincode: po.Pincode,
                            type: 'pincode'
                        }));
                    }
                } else {
                    // Search by name (OSM)
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&countrycodes=in&limit=10&accept-language=en`;
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'QR-Brand-Rice-Hub/1.0'
                        }
                    });
                    const data = await response.json();

                    if (data && data.length > 0) {
                        results = data.map(place => {
                            const addr = place.address;
                            const village = addr.village || addr.suburb || addr.town || addr.city || addr.hamlet || addr.neighbourhood || place.display_name.split(',')[0];
                            const district = addr.state_district || addr.district || addr.county || addr.city_district || '';
                            const state = addr.state || '';
                            const pincode = addr.postcode || place.display_name.match(/\b\d{6}\b/)?.[0] || '';

                            return {
                                name: village,
                                subtext: `${district ? district + ', ' : ''}${state}`,
                                village,
                                city: district,
                                state,
                                pincode,
                                type: 'place'
                            };
                        });
                    }
                }

                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (err) {
                console.error("Search error:", err);
                setError("Network error. Please try again.");
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setIsSearching(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`;
                const response = await fetch(url, {
                    headers: { 'User-Agent': 'QR-Brand-Rice-Hub/1.0' }
                });
                const data = await response.json();

                if (data && data.address) {
                    const addr = data.address;
                    const village = addr.village || addr.suburb || addr.town || addr.city || addr.hamlet || addr.neighbourhood || data.display_name.split(',')[0];
                    const selected = {
                        name: village,
                        village,
                        city: addr.state_district || addr.district || addr.county || addr.city_district || '',
                        state: addr.state || '',
                        pincode: addr.postcode || data.display_name.match(/\b\d{6}\b/)?.[0] || '',
                        type: 'gps'
                    };
                    setQuery(village);
                    onSelect(selected);
                }
            } catch (err) {
                setError("Failed to detect address. Please search manually.");
            } finally {
                setIsSearching(false);
            }
        }, () => {
            setError("Location access denied.");
            setIsSearching(false);
        });
    };

    return (
        <div className="space-y-3 relative">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Village / Pincode Search</label>
                <button
                    type="button"
                    onClick={detectLocation}
                    className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-primary-700 transition-colors"
                >
                    <Navigation className="w-3 h-3" /> Use Current Location
                </button>
            </div>

            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                        <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Enter Pincode (e.g. 533341) or Village name..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-sm"
                    autoComplete="off"
                />

                {error && (
                    <div className="absolute -bottom-6 left-1 flex items-center gap-1 text-[10px] font-bold text-red-500">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </div>
                )}
            </div>

            {/* Suggestions Popover */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-2xl rounded-[1.5rem] border border-gray-100 z-[100] max-h-72 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 bg-gray-50/50 border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matching Locations ({suggestions.length})</p>
                    </div>
                    <div className="p-2 space-y-1">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    setQuery(s.name);
                                    setSuggestions([]);
                                    setShowSuggestions(false);
                                    onSelect(s);
                                }}
                                className="w-full flex items-center gap-4 p-3.5 hover:bg-primary-50 rounded-xl transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {s.type === 'pincode' ? (
                                        <Home className="w-5 h-5 text-primary-600" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-gray-900 truncate text-[13px]">{s.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate">{s.subtext} {s.pincode ? `• ${s.pincode}` : ''}</p>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalAddressSearch;
