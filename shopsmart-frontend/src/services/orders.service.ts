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
   * GET /api/v1/orders/:orderId — requires authentication.
   * Returns the full order detail including items, status history, and shipment.
   */
  getById: async (orderId: string): Promise<Order> => {
    return apiClient<Order>(`/orders/${orderId}`);
  },

  /**
   * POST /api/v1/orders/:orderId/cancellation — requires authentication.
   * Cancels an order that is still pending or confirmed.
   */
  cancel: async (orderId: string, reason?: string): Promise<void> => {
    return apiClient<void>(`/orders/${orderId}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
