/**
 * Cart Module — public interface.
 * Responsibility: cart/cart-item management for both guests (Redis) and
 * registered users (PostgreSQL), behind one unified service.
 * Dependencies: products, inventory, coupons (all via public interfaces).
 * Boundary: never creates an Order — Checkout module owns that handoff.
 */
export { cartRoutes } from './cart.routes';

export async function getCart(userId: string) {
  const { cartService } = await import('./cart.service');
  return cartService.getCart({ userId });
}

export async function clearCart(userId: string) {
  const { cartService } = await import('./cart.service');
  return cartService.clear({ userId });
}

/** Registered-user-only convenience wrapper, used by e.g. Wishlist's move-to-cart (FR-041). */
export async function addItemForUser(userId: string, productVariantId: string, quantity: number) {
  const { cartService } = await import('./cart.service');
  return cartService.addItem({ userId }, productVariantId, quantity);
}
