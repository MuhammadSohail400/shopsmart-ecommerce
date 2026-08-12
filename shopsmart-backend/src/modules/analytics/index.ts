/**
 * Analytics Module — public interface.
 * Responsibility: sales/customer/inventory reporting, abandoned-cart
 * tracking. Computed from existing Order/Product data via read-only
 * queries — no denormalized duplicate data.
 * Dependencies: none directly exposed; consumes Order/Product tables
 * read-only (an accepted exception to the "only via public interface"
 * rule for pure reporting aggregation, per Backend Standards Section 4).
 */
export { analyticsRoutes } from './analytics.routes';

export async function snapshotAbandonedCart(userId: string | undefined, cartItems: object, subtotal: number) {
  const { analyticsService } = await import('./analytics.service');
  return analyticsService.snapshotAbandonedCart(userId, cartItems, subtotal);
}
