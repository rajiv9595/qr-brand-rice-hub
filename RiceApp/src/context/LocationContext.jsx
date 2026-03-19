import React, { createContext, useState, useContext, useCallback } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null); // { lat, lng, name, district, state }
  const [locLoading, setLocLoading] = useState(false);

  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Rice-App-Mobile/1.0' }
      });
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const village = addr.village || addr.suburb || addr.town || addr.city || addr.hamlet || addr.neighbourhood || data.display_name.split(',')[0];
        const district = addr.state_district || addr.district || addr.county || '';
        const state = addr.state || '';
        const pincode = addr.postcode || data.display_name.match(/\b\d{6}\b/)?.[0] || '';
        return { name: village, district, state, pincode };
      }
    } catch (err) {
      console.warn('Reverse geocode failed', err);
    }
    return { name: 'మీ స్థానం', district: '', state: '' };
  };

  const requestLocation = useCallback(async () => {
    setLocLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const isGranted = 
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        if (!isGranted) {
          Alert.alert(
            'Location Permission Required',
            'We need your location to show nearby rice shops and calculate delivery. Please enable it in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          setLocLoading(false);
          return null;
        }
      }

      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const geoInfo = await reverseGeocode(latitude, longitude);
            
            const newLoc = {
              lat: latitude,
              lng: longitude,
              ...geoInfo
            };
            setLocation(newLoc);
            setLocLoading(false);
            resolve(newLoc);
          },
          (error) => {
            console.warn('Location error:', error.code, error.message);
            setLocLoading(false);
            if (error.code === 2) {
              Alert.alert('GPS is Off', 'Please turn on your GPS/Location services.');
            }
            resolve(null);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 10000,
            showLocationDialog: true,
            forceRequestLocation: true 
          }
        );
      });
    } catch (e) {
      console.warn('LocationContext error:', e);
      setLocLoading(false);
      return null;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    return await requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider value={{ location, locLoading, requestLocation, getCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);