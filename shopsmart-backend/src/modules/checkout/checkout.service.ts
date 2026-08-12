import { checkoutRepository } from './checkout.repository';
import { getCartView, clearCartView } from '@modules/cart';
import { getAddressForUser } from '@modules/users';
import { calculateShippingCost } from '@modules/shipping';
import { validateCoupon } from '@modules/coupons';
import { createPendingOrder } from '@modules/orders';
import { initiatePayment } from '@modules/payments';
import { getTaxRateForRegion } from '@modules/settings';
import { PaymentMethod } from '@prisma/client';
import { BusinessRuleError, ConflictError, NotFoundError } from '@shared/errors';
import type { CheckoutContext } from './checkout.types';
import type { CreateSessionBody, ConfirmSessionBody } from './checkout.validators';

// TODO(Phase 7 done): tax rate now comes from the Settings module's
// TaxRule lookup (BR-010) — see resolveAddress/createSession below.

interface ResolvedAddress {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  addressId?: string;
}

async function resolveAddress(ctx: CheckoutContext, body: CreateSessionBody): Promise<ResolvedAddress> {
  if (ctx.userId && body.addressId) {
    const address = await getAddressForUser(ctx.userId, body.addressId);
    if (!address) throw new NotFoundError('Address');
    return { ...address, postalCode: address.postalCode ?? undefined, addressId: address.id };
  }
  if (body.guestAddress) return body.guestAddress;
  throw new BusinessRuleError('ADDRESS_REQUIRED', 'A shipping address is required to check out');
}

export const checkoutService = {
  /**
   * Computes the full order preview (subtotal, tax, shipping, discount,
   * total) without creating anything transactional yet — matches API
   * Design Specification Section 9.14.
   */
  async createSession(ctx: CheckoutContext, body: CreateSessionBody) {
    const cart = await getCartView(ctx);
    if (cart.items.length === 0) {
      throw new BusinessRuleError('EMPTY_CART', 'Your cart is empty');
    }
    const outOfStockItem = cart.items.find((i) => !i.inStock);
    if (outOfStockItem) {
      throw new ConflictError(
        'STOCK_CONFLICT',
        `"${outOfStockItem.title}" no longer has enough stock available`,
      );
    }

    const address = await resolveAddress(ctx, body);

    // BR-011: throws SHIPPING_ZONE_UNSUPPORTED if the destination isn't covered
    const shipping = await calculateShippingCost(address.country, body.shippingMethod);

    const taxRate = await getTaxRateForRegion(address.country, address.region);
    const taxAmount = Math.round(cart.subtotal * taxRate * 100) / 100;

    let discountAmount = 0;
    let couponCode: string | undefined;
    if (cart.appliedCoupon) {
      discountAmount = cart.appliedCoupon.discountAmount;
      couponCode = cart.appliedCoupon.code;
    }

    const session = await checkoutRepository.create({
      userId: ctx.userId,
      guestCartId: ctx.guestCartId,
      addressId: address.addressId,
      guestAddress: ctx.userId ? undefined : (address as unknown as object),
      shippingMethod: body.shippingMethod,
      subtotal: cart.subtotal,
      taxAmount,
      shippingAmount: shipping.cost,
      discountAmount,
      couponCode,
    });

    return {
      sessionId: session.id,
      subtotal: cart.subtotal,
      taxAmount,
      shippingAmount: shipping.cost,
      discountAmount,
      totalAmount: Math.round((cart.subtotal + taxAmount + shipping.cost - discountAmount) * 100) / 100,
      shippingMethod: body.shippingMethod,
      expiresAt: session.expiresAt.toISOString(),
    };
  },

  /**
   * FR-057: re-validates stock and coupon at the final commit step, since
   * time has passed since the session was created. Creates the order
   * (pending) and hands off to Payments — see Orders/Payments module
   * comments for the pending → confirmed handshake (DDD Section 14.5).
   */
  async confirm(ctx: CheckoutContext, sessionId: string, body: ConfirmSessionBody, idempotencyKey: string) {
    const session = await checkoutRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Checkout session');
    if (session.expiresAt < new Date()) {
      throw new ConflictError('CHECKOUT_SESSION_EXPIRED', 'This checkout session has expired, please start again');
    }
    if (session.status !== 'pending') {
      throw new ConflictError('CHECKOUT_SESSION_ALREADY_USED', 'This checkout session has already been used');
    }

    const cart = await getCartView(ctx);
    if (cart.items.length === 0) throw new BusinessRuleError('EMPTY_CART', 'Your cart is empty');

    const outOfStockItem = cart.items.find((i) => !i.inStock);
    if (outOfStockItem) {
      throw new ConflictError(
        'STOCK_CONFLICT',
        `"${outOfStockItem.title}" no longer has enough stock available`,
      );
    }

    let couponInfo: { couponId: string; discountApplied: number; userId?: string } | undefined;
    if (session.couponCode) {
      const { coupon, discountAmount } = await validateCoupon(session.couponCode, cart.subtotal, ctx.userId);
      couponInfo = { couponId: coupon!.id, discountApplied: discountAmount, userId: ctx.userId };
    }

    const shippingAddress = session.addressId
      ? await getAddressForUser(ctx.userId!, session.addressId)
      : (session.guestAddress as unknown as ResolvedAddress);
    if (!shippingAddress) throw new NotFoundError('Shipping address');

    const totalAmount =
      Number(session.subtotal) +
      Number(session.taxAmount) +
      Number(session.shippingAmount) -
      Number(session.discountAmount);

    const order = await createPendingOrder({
      userId: ctx.userId,
      addressId: session.addressId ?? undefined,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        region: shippingAddress.region,
        postalCode: shippingAddress.postalCode ?? undefined,
        country: shippingAddress.country,
      },
      items: cart.items.map((i) => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
        priceAtPurchase: i.unitPrice,
      })),
      subtotal: Number(session.subtotal),
      taxAmount: Number(session.taxAmount),
      shippingAmount: Number(session.shippingAmount),
      discountAmount: Number(session.discountAmount),
      totalAmount,
    });

    const payment = await initiatePayment({
      orderId: order.id,
      amount: totalAmount,
      method: body.paymentMethod as PaymentMethod,
      idempotencyKey,
      couponInfo,
    });

    await checkoutRepository.markConfirmed(sessionId);
    await clearCartView(ctx);

    return { order, payment };
  },
};
