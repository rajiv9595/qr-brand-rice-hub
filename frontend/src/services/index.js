import api from './api';

export const riceService = {
    getPublicListings: (params) => api.get('/rice', { params }),
    searchListings: (params) => api.get('/rice/search', { params }),
    getRiceById: (id) => api.get(`/rice/${id}`),
    compareListings: (listingIds) => api.post('/rice/compare', { listingIds }),
};

export const reviewService = {
    getListingRatings: (id) => api.get(`/rice/${id}/ratings`),
    getListingReviews: (id) => api.get(`/rice/${id}/reviews`),
    submitReview: (data) => api.post('/reviews', data),
};

export const expertService = {
    getListingExpertReview: (id) => api.get(`/rice/${id}/expert-review`),
};

export const cookingService = {
    getListingCookingTips: (id) => api.get(`/rice/${id}/cooking-tips`),
};

export const marketService = {
    getMarketUpdates: (params) => api.get('/market-updates', { params }),
};

export { authService } from './authService';
export { supplierService } from './supplierService';
export { adminService } from './adminService';
export { watchlistService } from './watchlistService';
