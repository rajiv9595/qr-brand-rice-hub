// api/orderService.js
// Maps directly to REAL backend routes in backend/routes/orderRoutes.js
// All routes require authentication (protect middleware applied to all)

import client from './client';

export const orderService = {
  // POST /api/orders — Create a new order (Customer only)
  // Backend: orderController.createOrder
  // Body: { listingId, quantity, shippingAddress: { street, village, city, state, zipCode, phone, email } }
  // Returns: { success, data: Order }
  createOrder: (orderData) =>
    client.post('/orders', orderData),

  // GET /api/orders/my-orders — Get buyer's purchase history
  // Backend: orderController.getMyOrders  (authorize 'customer')
  // Returns: { success, data: [Order populated with listingId + supplierId] }
  getMyOrders: () =>
    client.get('/orders/my-orders'),

  // GET /api/orders/supplier-orders — Get trader's incoming orders
  // Backend: orderController.getSupplierOrders (authorize 'supplier')
  // NOTE: Backend route is /supplier-orders NOT /trader-orders
  getTraderOrders: () =>
    client.get('/orders/supplier-orders'),

  // PUT /api/orders/:id/status — Update order status (Supplier only)
  // Backend: orderController.updateOrderStatus
  // Body: { status } — one of: 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  // NOTE: Backend uses PUT not PATCH
  updateStatus: (id, status) =>
    client.put(`/orders/${id}/status`, { status }),

  // GET /api/orders/admin/stats — Admin order analytics
  // Backend: orderController.getAdminOrderStats (authorize 'admin')
  getAdminStats: () =>
    client.get('/orders/admin/stats'),
};
