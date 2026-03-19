// api/authService.js
// Authentication logic for the RiceApp using Phone OTP and Google Auth.

import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Initialize Google Sign In
try {
  GoogleSignin.configure({
    webClientId: '401036516298-9rqe5n5bc7nlaqtst6ums9h4ght5qrar.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
} catch (error) {
  console.warn('GoogleSignin config warning:', error.message);
}

export const authService = {
  // Google Sign In
  googleSignIn: async (role = 'customer') => {
    try {
      // Check if device has Google Play Services
      const playServicesAvailable = await GoogleSignin.hasPlayServices();
      if (!playServicesAvailable) {
        throw new Error('Google Play Services not available on this device');
      }
      
      // Force account selection every time so it doesn't auto-pick the first email
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore "not signed in" errors
      }
      
      // Sign in with Google
      const data = await GoogleSignin.signIn();
      // Handle different SDK versions (newer SDKs put everything in data.data)
      const idToken = data.idToken || data.data?.idToken;
      
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign In');
      }
      
      // Send idToken to backend for verification and token generation
      const res = await client.post('/auth/google', {
        idToken,
        role: role || 'customer',
      });

      if (res.data.success && res.data.data?.token) {
        const { token, ...userData } = res.data.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return res.data.data;
      }
      return res.data.data;
    } catch (error) {
      console.error('Google Sign In Error Detail:', {
        message: error.message,
        config: error.config?.url,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.message?.includes('12500') || error.message?.includes('DEVELOPER_ERROR')) {
        throw new Error('DEVELOPER_ERROR: SHA-1 signing key mismatch - Follow setup guide');
      }
      throw new Error(error.message || 'Google Sign In failed. Try Phone OTP instead.');
    }
  },

  // Email/Password Registration
  emailRegister: async (userData) => {
    try {
      const res = await client.post('/auth/register', userData);
      if (res.data.success && res.data.data?.token) {
        const { token, ...data } = res.data.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(data));
      }
      return res;
    } catch (error) {
       console.error('Email Register Error:', error);
       throw error;
    }
  },

  // Email/Password Login
  emailLogin: async (email, password) => {
    try {
      const res = await client.post('/auth/login', { email, password });
      if (res.data.success && res.data.data?.token) {
        const { token, ...data } = res.data.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(data));
      }
      return res;
    } catch (error) {
       console.error('Email Login Error:', error);
       throw error;
    }
  },

  // Sign out
  googleSignOut: async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  },

  // Send OTP to phone number
  sendOTP: (phone) =>
    client.post('/auth/send-otp', { phone }),

  // Verify OTP and get token
  verifyOTP: async (phone, otp) => {
    const res = await client.post('/auth/verify-otp', { phone, otp });
    if (res.data.success && res.data.data?.token) {
      const { token, ...userData } = res.data.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    }
    return res;
  },

  // Logout
  logout: async () => {
    await authService.googleSignOut();
  },

  // Get current logged in user from storage
  getCurrentUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update User Profile (Syncs with website)
  updateProfile: async (data) => {
    try {
      const res = await client.put('/auth/profile', data);
      if (res.data.success && res.data.data) {
        await AsyncStorage.setItem('user', JSON.stringify(res.data.data));
      }
      return res.data;
    } catch (error) {
       console.error('Update Profile Error:', error);
       throw error;
    }
  },

};

export default authService;
