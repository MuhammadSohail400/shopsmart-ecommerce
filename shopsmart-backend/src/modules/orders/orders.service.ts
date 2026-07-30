import { prisma } from '@config/database';
import { ordersRepository } from './orders.repository';
import { OrderStatus, Prisma } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError, BusinessRuleError } from '@shared/errors';
import { decrementStock, restoreStock } from '@modules/inventory';
import { recordRedemption } from '@modules/coupons';
import { createShipmentForOrder } from '@modules/shipping';
import type { CreateOrderInput } from './orders.types';

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SS-${datePart}-${randomPart}`;
}

export const ordersService = {
  /**
   * Step 1 of order creation: writes the Order + OrderItems in "pending"
   * status. No stock is touched here — a card payment that's abandoned
   * or fails leaves inventory untouched. Called by the Checkout module.
   */
  async createPendingOrder(input: CreateOrderInput) {
    const orderNumber = generateOrderNumber();
    return ordersRepository.createPending(orderNumber, input);
  },

  /**
   * Step 2: called once payment is confirmed (immediately for COD/bank
   * transfer, or from the Stripe webhook for card payments). Atomically
   * decrements stock for every item and transitions the order to
   * "confirmed" (DDD Section 14.5) — all-or-nothing.
   */
  async confirmPendingOrder(
    orderId: string,
    couponInfo?: { couponId: string; discountApplied: number; userId?: string },
  ) {
    const order = await ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    if (order.status !== OrderStatus.pending) {
      // Idempotency guard: webhook or payment retries must not re-confirm
      // (and re-decrement stock for) an already-confirmed order.
      return order;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of order.items) {
        await decrementStock(item.productVariantId, item.quantity, tx);
      }
      await ordersRepository.confirmInTx(tx, orderId);
      if (couponInfo) {
        await recordRedemption(
          couponInfo.couponId,
          orderId,
          couponInfo.discountApplied,
          couponInfo.userId,
          tx,
        );
      }
    });

    // Not part of the money/inventory-critical transaction (SDD Section 18).
    await createShipmentForOrder(orderId);
    return ordersRepository.findById(orderId);
  },

  async getById(orderId: string, requestingUser: { id: string; role: string }) {
    const isStaff = ['admin', 'support_agent'].includes(requestingUser.role);
    const order = isStaff
      ? await ordersRepository.findById(orderId)
      : await ordersRepository.findByIdForUser(orderId, requestingUser.id);

    if (!order) throw new NotFoundError('Order');
    return order;
  },

  async list(
    requestingUser: { id: string; role: string },
    filters: { status?: OrderStatus; cursor?: string; limit: number },
  ) {
    const isStaff = ['admin', 'support_agent'].includes(requestingUser.role);
    const { items, hasMore } = await ordersRepository.list({
      userId: isStaff ? undefined : requestingUser.id,
      ...filters,
    });
    return { items, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null, hasMore };
  },

  // BR-005: cancellation permitted only while "confirmed" (before "processing")
  async cancel(orderId: string, requestingUser: { id: string; role: string }) {
    const order = await ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    const isStaff = requestingUser.role === 'admin';
    if (!isStaff && order.userId !== requestingUser.id) throw new AuthorizationError();

    if (![OrderStatus.pending, OrderStatus.confirmed].includes(order.status)) {
      throw new ConflictError(
        'CANCELLATION_WINDOW_CLOSED',
        'This order can no longer be cancelled as it has already begun processing',
      );
    }

    const stockWasDecremented = order.status === OrderStatus.confirmed;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (stockWasDecremented) {
        // FR-082: restore stock only if it was actually decremented
        for (const item of order.items) {
          await restoreStock(item.productVariantId, item.quantity, tx);
        }
      }
      await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.cancelled } });
      await tx.orderStatusHistory.create({
        data: { orderId, status: OrderStatus.cancelled, changedBy: requestingUser.id },
      });
    });
  },

  async confirmDelivery(orderId: string, userId: string) {
    const order = await ordersRepository.findByIdForUser(orderId, userId);
    if (!order) throw new NotFoundError('Order');
    if (order.status !== OrderStatus.shipped) {
      throw new BusinessRuleError(
        'ORDER_NOT_SHIPPED',
        'This order cannot be marked as delivered until it has shipped',
      );
    }
    await ordersRepository.markDelivered(orderId, 'buyer');
  },

  async updateStatus(orderId: string, status: OrderStatus, changedBy: string) {
    const order = await ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    await ordersRepository.updateStatus(orderId, status, changedBy);
  },
};
