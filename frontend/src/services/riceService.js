import api from './api';

export const riceService = {
    // Public: Get all listings (paginated, filtered)
    getPublicListings: (params) => api.get('/rice', { params }),

    // Public: Search listings
    searchListings: (params) => api.get('/rice/search', { params }),

    // Public: Get single listing details
    getListing: (id) => api.get(`/rice/${id}`),

    // Public: Compare listings
    compareListings: (ids) => api.post('/rice/compare', { ids }),

    // Public: Get related data
    getRatings: (id) => api.get(`/rice/${id}/ratings`),
    getExpertReview: (id) => api.get(`/rice/${id}/expert-review`),
    getCookingTips: (id) => api.get(`/rice/${id}/cooking-tips`),
};