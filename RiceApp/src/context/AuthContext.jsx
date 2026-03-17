import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.warn('AuthContext load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem('user',  JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      setUser(userData);
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
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};