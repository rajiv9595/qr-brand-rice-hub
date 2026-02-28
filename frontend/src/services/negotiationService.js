import api from './api';

export const negotiationService = {
    createNegotiation: (data) => api.post('/negotiations', data),
    getMyNegotiations: () => api.get('/negotiations'),
    getNegotiation: (id) => api.get(`/negotiations/${id}`),
    addMessage: (id, data) => api.post(`/negotiations/${id}/messages`, data),
    acceptNegotiation: (id) => api.put(`/negotiations/${id}/accept`),
    rejectNegotiation: (id) => api.put(`/negotiations/${id}/reject`),
};
