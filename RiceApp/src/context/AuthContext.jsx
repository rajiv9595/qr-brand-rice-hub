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
      if (authRes && authRes.data && authRes.data.success) {
        let freshUser = authRes.data.data;

        if (freshUser.role === 'supplier') {
          try {
            const supplierRes = await client.get('/supplier/profile');
            if (supplierRes && supplierRes.data && supplierRes.data.success) {
              const s = supplierRes.data.data;
              // FLATTEN DATA IMMEDIATELY 🛡️
              freshUser = { 
                ...freshUser, 
                millName: s.millName || freshUser.millName,
                gstNumber: s.gstNumber,
                traderType: s.traderType,
                bankDetails: s.bankDetails,
                upiId: s.upiId,
                ifscCode: s.bankDetails?.ifscCode || s.ifscCode,
                district: s.district || freshUser.district,
                state: s.state || freshUser.state,
                isVerified: s.userId?.isVerified ?? freshUser.isVerified,
                autoActivateAt: s.userId?.autoActivateAt ?? null
              };
            }
          } catch (e) {
             console.warn('Supplier sync error:', e.message);
          }
        }

        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
        return freshUser;
      }
    } catch (e) {
      console.warn('syncUser error:', e.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
        await syncUser();
      } catch (e) {
        console.warn('AuthContext init error:', e);
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
        await syncUser();
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