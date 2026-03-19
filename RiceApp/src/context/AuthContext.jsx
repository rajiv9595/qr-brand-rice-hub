import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const authRes = await client.get('/auth/profile');
      if (authRes.data.success) {
        let freshUser = authRes.data.data;

        if (freshUser.role === 'supplier') {
          try {
            const supplierRes = await client.get('/suppliers/profile');
            if (supplierRes.data.success) {
              const s = supplierRes.data.data;
              freshUser = { 
                ...freshUser, 
                ...s, 
                isVerified: s.userId?.isVerified ?? freshUser.isVerified,
                autoActivateAt: s.userId?.autoActivateAt ?? null
              };
            }
          } catch (e) {
            console.warn('Supplier sync error:', e);
          }
        }

        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
        return freshUser;
      }
    } catch (e) {
      console.warn('syncUser error:', e);
    }
  };

  // On app start — check if user is already logged in and refresh
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        await syncUser(); // Refresh with latest truth
      } catch (e) {
        console.warn('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (userData, token) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      if (token) {
        await AsyncStorage.setItem('token', token);
        await syncUser(); // Complete business profile sync after login 🛡️
      }
    } catch (e) {
      console.warn('AuthContext login error:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
      setUser(null);
    } catch (e) {
      console.warn('AuthContext logout error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
};