import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies (refresh token) with every request
});

// Add request interceptor for JWT
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Track refresh state to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

// Add response interceptor with automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh for 401 errors that aren't already refresh/login requests
        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');
        const isLoginRequest = originalRequest.url?.includes('/auth/login');
        const isRegisterRequest = originalRequest.url?.includes('/auth/register');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshRequest &&
            !isLoginRequest &&
            !isRegisterRequest
        ) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token using the httpOnly cookie
                const res = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                if (res.data.success && res.data.data?.token) {
                    const newToken = res.data.data.token;
                    sessionStorage.setItem('token', newToken);

                    // Update user data if returned
                    const { token: _, ...userData } = res.data.data;
                    sessionStorage.setItem('user', JSON.stringify(userData));

                    processQueue(null, newToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh failed — force logout
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');

                const isLoginPage = window.location.pathname.includes('login');
                if (!isLoginPage) {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For non-401 errors or already retried, reject normally
        return Promise.reject(error);
    }
);

export default api;
