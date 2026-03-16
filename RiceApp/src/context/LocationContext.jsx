import React, { createContext, useState, useContext, useCallback } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null); // { lat, lng, name }
  const [locLoading, setLocLoading] = useState(false);

  const requestLocation = useCallback(async () => {
    setLocLoading(true);
    try {
      // Request permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title:   'Location Permission',
            message: 'App needs location to find nearby rice shops',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Location needed',
            'Please allow location to find shops near you'
          );
          setLocLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat:  pos.coords.latitude,
            lng:  pos.coords.longitude,
            name: 'మీ స్థానం', // Will be reverse-geocoded later
          });
          setLocLoading(false);
        },
        (error) => {
          console.warn('Location error:', error.message);
          // Fallback to Kadapa, AP coords for demo
          setLocation({ lat: 14.4673, lng: 78.8242, name: 'Kadapa, AP' });
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } catch (e) {
      console.warn('LocationContext error:', e);
      setLocLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, locLoading, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);