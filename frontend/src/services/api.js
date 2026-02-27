import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Don't redirect if we're already on a login page or it's an auth request
            const isLoginPage = window.location.pathname.includes('login');
            const isAuthRequest = error.config.url.includes('/auth/login');

            if (!isLoginPage && !isAuthRequest) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
