// App.jsx — Root component
// Wraps everything in context providers and starts navigation

import React, { useEffect, useState } from 'react';
import { NavigationContainer }        from '@react-navigation/native';
import { SafeAreaProvider }           from 'react-native-safe-area-context';
import AsyncStorage                   from '@react-native-async-storage/async-storage';
import { LogBox }                     from 'react-native';

import { AuthContext, AuthProvider }  from './src/context/AuthContext';
import { LangProvider }               from './src/context/LangContext';
import { LocationProvider }           from './src/context/LocationContext';
import RootNavigator                  from './src/navigation/RootNavigator';

// Ignore known warnings from @react-native-voice/voice package
LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method'
]);

const App = () => {
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
