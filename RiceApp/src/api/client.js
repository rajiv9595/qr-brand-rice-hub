// api/client.js
// Reuses the same Render backend as qrbrands.in
// Only difference from website: uses AsyncStorage instead of sessionStorage

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.API_BASE_URL || 'https://qr-brand-rice-hub-api.onrender.com/api';

const client = axios.create({
  baseURL:         BASE_URL,
  timeout:         15000,
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 — same logic as website api.js
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    const isAuthRoute = orig.url?.includes('/auth/') && !orig.url?.includes('/auth/profile');

    if (error.response?.status === 401 && !orig._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => {
            orig.headers.Authorization = `Bearer ${token}`;
            return client(orig);
          });
      }

      orig._retry    = true;
      isRefreshing   = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        if (data.success && data.data?.token) {
          const { token: newToken, ...userData } = data.data;
          await AsyncStorage.setItem('token', newToken);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          processQueue(null, newToken);
          orig.headers.Authorization = `Bearer ${newToken}`;
          return client(orig);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(['token', 'user']);
        // RootNavigator will detect missing token and redirect to Login
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
