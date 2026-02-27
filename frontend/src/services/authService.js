import api from './api';

export const authService = {
    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success && res.data.data) {
            const { token, ...user } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    verifyMFA: async (userId, code) => {
        const res = await api.post('/auth/verify-mfa', { userId, code });
        if (res.data.success) {
            const { token, ...user } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        if (res.data.success) {
            const { token, ...user } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    hasRole: (role) => {
        const user = authService.getCurrentUser();
        return user && user.role === role;
    },

    getProfile: async () => {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
            const user = res.data.data;
            // Update local storage with fresh data, keeping the token
            const token = localStorage.getItem('token');
            // Ensure we don't lose the token if it's not in the profile response (which it isn't)
            localStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    updateProfile: async (userData) => {
        const res = await api.put('/auth/profile', userData);
        if (res.data.success) {
            const { token, ...user } = res.data.data;
            if (token) localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    }
};
