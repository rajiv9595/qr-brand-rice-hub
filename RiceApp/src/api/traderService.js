// api/traderService.js
// Maps directly to REAL backend routes in backend/routes/supplierRoutes.js
// All routes require auth + supplier role (protect + authorize('supplier'))

import client from './client';

export const traderService = {
  // GET /api/supplier/profile — Get supplier's own profile
  // Backend: supplierController.getProfile
  getProfile: () =>
    client.get('/supplier/profile'),

  // POST /api/supplier/profile — Create or update supplier profile (multipart)
  // Backend: supplierController.upsertProfile
  // Accepts shopPhoto image via FormData
  updateProfile: (data) =>
    client.post('/supplier/profile', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  // GET /api/supplier/reviews — Get reviews for the supplier
  // Backend: reviewController.getSupplierReviews
  getReviews: () =>
    client.get('/supplier/reviews'),

  // GET /api/supplier/insights/benchmarking — Get supplier performance insights
  // Backend: insightsController.getSupplierBenchmarking
  getBenchmarking: () =>
    client.get('/supplier/insights/benchmarking'),

  // NOTE: There is NO /supplier/stats endpoint in the backend.
  // Dashboard stats are computed from my-listings + supplier-orders data.
};
