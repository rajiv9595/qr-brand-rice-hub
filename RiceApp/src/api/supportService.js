// api/supportService.js
import client from './client';

export const supportService = {
  // GET /api/support/my-tickets — Get all support tickets for user
  getMyTickets: () =>
    client.get('/support/my-tickets'),

  // POST /api/support/ticket — Create new support ticket
  createTicket: (data) =>
    client.post('/support/ticket', data),

  // POST /api/support/ticket/:id/message — Add message to ticket
  addMessage: (id, message) =>
    client.post(`/support/ticket/${id}/message`, { message }),
};
