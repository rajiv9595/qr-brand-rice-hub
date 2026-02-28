import api from './api';

export const authService = {
    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success && res.data.data) {
            const { token, ...user } = res.data.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    googleAuth: async (idToken, role) => {
        const res = await api.post('/auth/google', { idToken, role });
        if (res.data.success && res.data.data) {
            const { token, ...user } = res.data.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    verifyMFA: async (userId, code) => {
        const res = await api.post('/auth/verify-mfa', { userId, code });
        if (res.data.success) {
            const { token, ...user } = res.data.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        if (res.data.success) {
            const { token, ...user } = res.data.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    logout: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return sessionStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!sessionStorage.getItem('token');
    },

    hasRole: (role) => {
        const user = authService.getCurrentUser();
        return user && user.role === role;
    },

    getProfile: async () => {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
            const user = res.data.data;
            // Update session storage with fresh data, keeping the token
            const token = sessionStorage.getItem('token');
            sessionStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    updateProfile: async (userData) => {
        const res = await api.put('/auth/profile', userData);
        if (res.data.success) {
            const { token, ...user } = res.data.data;
            if (token) sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
        }
        return res.data;
    },

    deleteAccount: async () => {
        const res = await api.delete('/auth/profile');
        if (res.data.success) {
            authService.logout();
        }
        return res.data;
    },

    forgotPassword: async (email) => {
        const res = await api.post('/auth/forgotpassword', { email });
        return res.data;
    },

    resetPassword: async (token, password) => {
        const res = await api.put(`/auth/resetpassword/${token}`, { password });
        if (res.data.success && res.data.token) {
            // Optional: Auto log in by setting token, but for now we won't 
            // since getProfile is requested later, let user login manually or just set it.
        }
        return res.data;
    }
};
