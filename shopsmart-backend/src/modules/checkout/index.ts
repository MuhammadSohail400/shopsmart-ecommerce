/**
 * Checkout Module — public interface.
 * Responsibility: orchestrates cart → order handoff (address, shipping,
 * tax, coupon re-validation, payment initiation). The only module allowed
 * to call multiple other modules' write operations across one logical
 * flow (Backend Standards Section 4) — though the actual atomic DB
 * transaction lives in Orders (DDD Section 14.5), not here.
 * Dependencies: cart, users, shipping, coupons, orders, payments.
 */
export { checkoutRoutes } from './checkout.routes';
