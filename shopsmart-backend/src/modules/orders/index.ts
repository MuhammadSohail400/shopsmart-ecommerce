/**
 * Orders Module — public interface.
 * Responsibility: sole owner of Order/OrderItem/OrderStatusHistory.
 * Order creation is a two-step handshake: createPendingOrder() (called by
 * Checkout) followed by confirmPendingOrder() (called by Payments once
 * payment succeeds) — see DDD Section 14.5 and Payments module comments
 * for why a Payment can't be created against an Order that doesn't exist
 * yet, but stock can't be decremented before payment is confirmed either.
 * Dependencies: inventory, coupons, shipping (all via public interfaces).
 */
export { ordersRoutes } from './orders.routes';
export type { CreateOrderInput } from './orders.types';

export async function createPendingOrder(input: import('./orders.types').CreateOrderInput) {
  const { ordersService } = await import('./orders.service');
  return ordersService.createPendingOrder(input);
}

export async function confirmPendingOrder(
  orderId: string,
  couponInfo?: { couponId: string; discountApplied: number; userId?: string },
) {
  const { ordersService } = await import('./orders.service');
  return ordersService.confirmPendingOrder(orderId, couponInfo);
}

export async function getOrderById(orderId: string, requestingUser: { id: string; role: string }) {
  const { ordersService } = await import('./orders.service');
  return ordersService.getById(orderId, requestingUser);
}
