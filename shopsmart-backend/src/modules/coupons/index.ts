/**
 * Coupons Module — public interface.
 * Responsibility: discount code validation and redemption tracking.
 * Dependencies: none. Never touches Cart/Order directly — callers apply
 * the returned discount amount themselves (Backend Standards Section 4).
 */
export { couponsRoutes } from './coupons.routes';

export async function validateCoupon(code: string, cartSubtotal: number, userId?: string) {
  const { couponsService } = await import('./coupons.service');
  return couponsService.validateAndCompute(code, cartSubtotal, userId);
}

export async function recordRedemption(
  couponId: string,
  orderId: string,
  discountApplied: number,
  userId?: string,
  tx?: import('@prisma/client').Prisma.TransactionClient,
) {
  const { couponsService } = await import('./coupons.service');
  return couponsService.recordRedemption(couponId, orderId, discountApplied, userId, tx);
}
