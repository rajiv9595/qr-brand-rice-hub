// api/riceService.js
// Maps directly to REAL backend routes in backend/routes/riceRoutes.js
// All endpoints verified against the actual backend controller functions.

import client from './client';

export const riceService = {
  // ── Public Routes (no auth needed) ──────────────────────────────────

  // GET /api/rice — All active + approved public listings
  // Backend: riceController.getPublicListings
  // Returns: { success, data: [RiceListing populated with supplierId] }
  getPublicListings: () =>
    client.get('/rice'),

  // GET /api/rice/best-deals — Budget-friendly listings sorted by rating
  // Backend: riceController.getBestDeals
  // Returns: { success, data: [RiceListing populated with supplierId] }
  getBestDeals: (lat, lng, radiusKm = 50) =>
    client.get('/rice/best-deals', { params: { lat, lng, radius: radiusKm } }),

  // GET /api/rice/search — Advanced search with filters + geo
  // Backend: riceController.searchListings
  // Params: riceVariety, usageCategory, riceType, priceCategory, packSize,
  //         minPrice, maxPrice, district, state, lat, lng, distance, sortBy, page, limit
  // Returns: { success, totalResults, currentPage, totalPages, results }
  searchListings: (params) =>
    client.get('/rice/search', { params }),

  // GET /api/rice/:id — Single listing detail
  // Backend: riceController.getListingById
  // Returns: { success, data: RiceListing }
  getListing: (id) =>
    client.get(`/rice/${id}`),

  // POST /api/rice/compare — Compare 2-3 listings
  // Backend: riceController.compareListings
  compareListings: (listingIds) =>
    client.post('/rice/compare', { listingIds }),

  // GET /api/market-updates/summary — Aggregated avg prices per variety
  // Backend: marketUpdateController.getMarketSummary
  // Returns: { success, data: [{ variety, avgPrice, minPrice, maxPrice, trend }] }
  getMarketPrices: () =>
    client.get('/market-updates/summary'),

  // GET /api/market-updates — News/articles with pagination
  // Backend: marketUpdateController.getMarketUpdates
  // Returns: { success, totalResults, currentPage, totalPages, data }
  getMarketUpdates: (params) =>
    client.get('/market-updates', { params }),

  // ── Trader Routes (requires auth + supplier role) ───────────────────

  // GET /api/rice/my-listings — Supplier's own listings
  // Backend: riceController.getMyListings
  getMyListings: () =>
    client.get('/rice/my-listings'),

  // POST /api/rice — Create listing (multipart form with images)
  // Backend: riceController.createListing
  createListing: (formData) =>
    client.post('/rice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // PUT /api/rice/:id — Update listing (multipart form with images)
  // Backend: riceController.updateListing
  updateListing: (id, formData) =>
    client.put(`/rice/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // PATCH /api/rice/:id/activate — Activate listing
  // Backend: riceController.activateListing
  activateListing: (id) =>
    client.patch(`/rice/${id}/activate`),

  // PATCH /api/rice/:id/deactivate — Deactivate listing
  // Backend: riceController.deactivateListing
  deactivateListing: (id) =>
    client.patch(`/rice/${id}/deactivate`),

  // DELETE /api/rice/:id — Delete listing
  // Backend: riceController.deleteListing
  deleteListing: (id) =>
    client.delete(`/rice/${id}`),
};
