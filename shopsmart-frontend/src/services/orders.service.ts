import { apiClient } from '@/lib/api-client';
import { Order, OrdersListResponse } from '@/types/checkout.types';

export type OrderStatusFilter =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

export const ordersService = {
  /**
   * GET /api/v1/orders — requires authentication.
   * Returns a cursor-paginated list of the current user's orders.
   */
  list: async (params?: {
    status?: OrderStatusFilter;
    cursor?: string;
    limit?: number;
  }): Promise<OrdersListResponse> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiClient<OrdersListResponse>(`/orders${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/v1/orders/track/:orderQuery — public endpoint.
   * Returns order detail by order number (e.g. ASORA-20260829-...) or UUID.
   */
  track: async (orderQuery: string): Promise<Order> => {
    return apiClient<Order>(`/orders/track/${encodeURIComponent(orderQuery)}`);
  },

  /**
   * POST /api/v1/orders/track/:orderQuery/cancel — public endpoint for guest/user cancellation.
   */
  cancelTracked: async (orderQuery: string, reason?: string): Promise<void> => {
    return apiClient<void>(`/orders/track/${encodeURIComponent(orderQuery)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * GET /api/v1/orders/:orderId
   * Returns order detail. Falls back to public track endpoint if guest.
   */
  getById: async (orderId: string): Promise<Order> => {
    try {
      return await apiClient<Order>(`/orders/${orderId}`);
    } catch {
      return await apiClient<Order>(`/orders/track/${encodeURIComponent(orderId)}`);
    }
  },

  /**
   * POST /api/v1/orders/:orderId/cancellation
   * Cancels an order that is still pending or confirmed. Falls back to track cancellation.
   */
  cancel: async (orderId: string, reason?: string): Promise<void> => {
    try {
      return await apiClient<void>(`/orders/${orderId}/cancellation`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch {
      return await apiClient<void>(`/orders/track/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    }
  },
};
