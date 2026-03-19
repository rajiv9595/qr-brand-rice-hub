// LocationContext.jsx
// Handles GPS permissions, current location, and manual district fallback.

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const LocationContext = createContext();

// Professional Fallback: Center coordinates for major AP Districts
export const AP_DISTRICTS = [
  { name: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { name: 'Nellore', lat: 14.4426, lng: 79.9865 },
  { name: 'Vijayawada (NTR)', lat: 16.5062, lng: 80.6480 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'East Godavari', lat: 17.0005, lng: 81.7778 },
  { name: 'West Godavari', lat: 16.7107, lng: 81.1035 },
  { name: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  { name: 'Eluru', lat: 16.7107, lng: 81.1035 },
  { name: 'Krishna', lat: 16.1901, lng: 81.1340 },
  { name: 'Prakasam', lat: 15.5057, lng: 80.0499 },
  { name: 'Srikakulam', lat: 18.2969, lng: 83.8938 },
  { name: 'Vizianagaram', lat: 18.1067, lng: 83.3956 },
  { name: 'Kurnool', lat: 15.8281, lng: 78.0373 },
  { name: 'Kadapa', lat: 14.4673, lng: 78.8242 },
  { name: 'Anantapur', lat: 14.6819, lng: 77.6006 },
  { name: 'Chittoor', lat: 13.2172, lng: 79.1003 },
];

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null); // { lat, lng, name, district, state, isManual }
  const [locLoading, setLocLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);

  const setManualLocation = (districtName) => {
    const dist = AP_DISTRICTS.find(d => d.name === districtName);
    if (dist) {
      const manualData = {
        lat: dist.lat,
        lng: dist.lng,
        name: dist.name,
        district: dist.name,
        state: 'Andhra Pradesh',
        isManual: true
      };
      setLocation(manualData);
      setIsManual(true);
      return manualData;
    }
    return null;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Using open-source Nominatim for demonstration. 
      // In production (1 lakh+ users), replace with Google Maps API.
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'RiceApp-Expert-Agent' }
      });
      const data = await res.json();
      const addr = data.address || {};
      return {
        name: data.display_name,
        district: addr.city_district || addr.district || addr.county || addr.city || 'Unknown',
        state: addr.state || 'Andhra Pradesh'
      };
    } catch (err) {
      console.warn('Geocode error:', err);
      return null;
    }
  };

  const requestLocation = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Rejected', 'GPS is needed for nearby shops. Please select a district manually.');
        return false;
      }
    }
    return true;
  }, []);

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocation();
    if (!hasPermission) return null;

    setLocLoading(true);
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const info = await reverseGeocode(latitude, longitude);
          const locData = {
            lat: latitude,
            lng: longitude,
            ...info,
            isManual: false
          };
          setLocation(locData);
          setIsManual(false);
          setLocLoading(false);
          resolve(locData);
        },
        (error) => {
          console.warn('GPS Error:', error);
          setLocLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider value={{ 
      location, 
      setLocation, 
      locLoading, 
      requestLocation, 
      getCurrentLocation, 
      setManualLocation, 
      isManual 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
