// App.jsx — Root component
// Wraps everything in context providers and starts navigation

import React, { useEffect, useState } from 'react';
import { NavigationContainer }        from '@react-navigation/native';
import { SafeAreaProvider }           from 'react-native-safe-area-context';
import AsyncStorage                   from '@react-native-async-storage/async-storage';
import { LogBox }                     from 'react-native';
import axios                          from 'axios';

import './src/i18n'; // Initialize i18n

import { AuthContext, AuthProvider }  from './src/context/AuthContext';
import { LangProvider }               from './src/context/LangContext';
import { LocationProvider }           from './src/context/LocationContext';
import RootNavigator                  from './src/navigation/RootNavigator';

// API base URL for wake-up
const API_BASE_URL = process.env.API_BASE_URL || 'https://qr-brand-rice-hub-api.onrender.com/api';

// Ignore known warnings from @react-native-voice/voice package
LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method'
]);

const App = () => {
  // Wake up backend on app start (for free tier hosting)
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        // Ping the backend to wake it from sleep
        // Using a simple endpoint that doesn't require auth
        const response = await axios.get(`${API_BASE_URL}/rice`, {
          timeout: 10000, // 10 second timeout
        });
        console.log('Backend is awake:', response.status);
      } catch (error) {
        console.log('Backend wake-up attempt (expected for sleeping server):', error.message);
        // This is expected if backend is sleeping - the request itself will wake it up
      }
    };

    wakeUpBackend();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <LangProvider>
        <AuthProvider>
          <LocationProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </LocationProvider>
        </AuthProvider>
      </LangProvider>
    </SafeAreaProvider>
  );
};

export default App;
