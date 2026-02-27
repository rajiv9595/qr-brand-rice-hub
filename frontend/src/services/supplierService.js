import api from './api';

export const supplierService = {
    // Get supplier profile
    getProfile: () => api.get('/supplier/profile'),

    // Create supplier profile
    createProfile: (data) => api.post('/supplier/profile', data),

    // Update supplier profile (uses same endpoint as create)
    updateProfile: (data) => api.post('/supplier/profile', data),

    // Get supplier's rice listings
    getMyListings: () => api.get('/rice/my-listings'),

    // Create new rice listing
    createListing: (formData) => api.post('/rice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Update rice listing stock
    updateStock: (id, stockAvailable) => api.put(`/rice/${id}`, { stockAvailable }),

    // Update rice listing full (Multipart)
    updateListing: (id, formData) => api.put(`/rice/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Deactivate listing
    deactivateListing: (id) => api.patch(`/rice/${id}/deactivate`),

    // Activate listing
    activateListing: (id) => api.patch(`/rice/${id}/activate`),

    // Delete listing
    deleteListing: (id) => api.delete(`/rice/${id}`),

    // Get dashboard stats
    getDashboardStats: async () => {
        const res = await api.get('/rice/my-listings');
        const listings = res.data.data || [];

        return {
            total: listings.length,
            approved: listings.filter(l => l.approvalStatus === 'approved').length,
            pending: listings.filter(l => l.approvalStatus === 'pending').length,
            rejected: listings.filter(l => l.approvalStatus === 'rejected').length,
        };
    },

    // Get supplier reviews
    getReviews: () => api.get('/supplier/reviews'),
};
