import api from './api';

export const adminService = {
    // Dashboard Stats
    getDashboardStats: () => api.get('/admin/dashboard/stats'),

    // Listing Management
    getAllListings: (params) => api.get('/admin/listings', { params }),
    approveListing: (id) => api.patch(`/admin/listings/${id}/approve`),
    rejectListing: (id, feedback) => api.patch(`/admin/listings/${id}/reject`, { reason: feedback }),
    deactivateListing: (id) => api.patch(`/admin/listings/${id}/deactivate`),
    activateListing: (id) => api.patch(`/admin/listings/${id}/approve`), // Re-use approve for activation since it sets isActive: true

    // Supplier Management
    getAllSuppliers: (params) => api.get('/admin/suppliers', { params }),
    getSupplierById: (id) => api.get(`/admin/suppliers/${id}`),
    deactivateSupplier: (id) => api.patch(`/admin/suppliers/${id}/deactivate`),

    // Review Moderation
    getAllReviews: (params) => api.get('/admin/reviews', { params }),
    deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
    flagReview: (id) => api.patch(`/admin/reviews/${id}/flag`),

    // Expert Review Management
    getAllExpertReviews: (params) => api.get('/admin/expert-reviews', { params }),
    createExpertReview: (data) => api.post('/admin/expert-reviews', data),
    updateExpertReview: (id, data) => api.put(`/admin/expert-reviews/${id}`, data),
    deleteExpertReview: (id) => api.delete(`/admin/expert-reviews/${id}`),

    // Cooking Tips Management
    // Cooking Tips Management
    getAllCookingTips: (params) => api.get('/cooking-tips', { params }),
    createCookingTip: (data) => api.post('/cooking-tips', data),
    updateCookingTip: (id, data) => api.put(`/cooking-tips/${id}`, data),
    deleteCookingTip: (id) => api.delete(`/cooking-tips/${id}`),

    // Market Updates Management
    getAllMarketUpdates: (params) => api.get('/admin/market-updates', { params }),
    createMarketUpdate: (data) => api.post('/admin/market-updates', data),
    updateMarketUpdate: (id, data) => api.put(`/admin/market-updates/${id}`, data),
    deleteMarketUpdate: (id) => api.delete(`/admin/market-updates/${id}`),
    // User Management
    getAllUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),

    // Support Management
    getAllSupportTickets: (params) => api.get('/admin/support', { params }),
    updateTicketStatus: (id, status) => api.patch(`/admin/support/${id}`, { status }),
    replyToTicket: (id, text) => api.post(`/admin/support/${id}/reply`, { text }),

    // Top Suppliers
    getTopSuppliers: () => api.get('/admin/dashboard/top-suppliers'),

    togglePriority: (id) => api.patch(`/admin/market-updates/${id}/toggle-priority`),
};
