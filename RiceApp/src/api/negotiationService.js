// api/negotiationService.js
import client from './client';

export const negotiationService = {
  // GET /api/negotiations — Get all negotiations for user
  getMyNegotiations: () =>
    client.get('/negotiations'),

  // POST /api/negotiations — Create new negotiation (Buyer only)
  createNegotiation: (data) =>
    client.post('/negotiations', data),

  // POST /api/negotiations/:id/messages — Add message/offer
  addMessage: (id, data) =>
    client.post(`/negotiations/${id}/messages`, data),

  // PUT /api/negotiations/:id/accept — Accept offer
  acceptNegotiation: (id) =>
    client.put(`/negotiations/${id}/accept`),

  // PUT /api/negotiations/:id/reject — Reject offer
  rejectNegotiation: (id) =>
    client.put(`/negotiations/${id}/reject`),
};
