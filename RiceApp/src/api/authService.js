// api/authService.js
// Authentication logic for the RiceApp using Phone OTP.

import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
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
    await AsyncStorage.multiRemove(['token', 'user']);
  },

  // Get current logged in user from storage
  getCurrentUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update user profile (role selection, etc.)
  updateProfile: (data) =>
    client.put('/auth/profile', data),
};
