
import api from './api';

export const supportService = {
    createTicket: (data) => api.post('/support', data),
    getMyTickets: () => api.get('/support/my-tickets'),
    addMessage: (id, text) => api.post(`/support/${id}/message`, { text })
};
