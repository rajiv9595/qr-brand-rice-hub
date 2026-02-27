import api from './api';

export const orderService = {
    createOrder: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    getSupplierOrders: () => api.get('/orders/supplier-orders'),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    getAdminStats: () => api.get('/orders/admin/stats')
};
