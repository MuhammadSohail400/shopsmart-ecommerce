import { prisma } from '@config/database';
import { OrderStatus, Prisma } from '@prisma/client';
import type { CreateOrderInput } from './orders.types';

export const ordersRepository = {
  /**
   * Creates the Order + OrderItems + initial "pending" status history row.
   * No stock is decremented here (DDD Section 14.3 reservation window) —
   * stock decrements only happen once payment is confirmed, in
   * confirmToConfirmed() below, so a card payment that never completes
   * never touches inventory.
   */
  async createPending(orderNumber: string, input: CreateOrderInput) {
    return prisma.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        addressId: input.addressId,
        shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
        subtotal: input.subtotal,
        taxAmount: input.taxAmount,
        shippingAmount: input.shippingAmount,
        discountAmount: input.discountAmount,
        totalAmount: input.totalAmount,
        status: OrderStatus.pending,
        items: {
          create: input.items.map((i) => ({
            productVariantId: i.productVariantId,
            quantity: i.quantity,
            priceAtPurchase: i.priceAtPurchase,
          })),
        },
        statusHistory: { create: { status: OrderStatus.pending } },
      },
      include: { items: true },
    });
  },

  /**
   * Transitions a pending order to confirmed inside the caller's
   * transaction (DDD Section 14.5) — used once payment is confirmed.
   */
  async confirmInTx(tx: Prisma.TransactionClient, orderId: string) {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.confirmed } });
    await tx.orderStatusHistory.create({ data: { orderId, status: OrderStatus.confirmed } });
  },

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } }, shipment: true },
    });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } }, shipment: true },
    });
  },

  async list(filters: { userId?: string; status?: OrderStatus; cursor?: string; limit: number }) {
    const where: Prisma.OrderWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    const items = await prisma.order.findMany({
      where,
      take: filters.limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > filters.limit;
    return { items: items.slice(0, filters.limit), hasMore };
  },

  updateStatus(id: string, status: OrderStatus, changedBy?: string) {
    return prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status } }),
      prisma.orderStatusHistory.create({ data: { orderId: id, status, changedBy } }),
    ]);
  },

  markDelivered(id: string, deliveryConfirmedBy: 'buyer' | 'auto') {
    return prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: OrderStatus.delivered, deliveredAt: new Date(), deliveryConfirmedBy },
      }),
      prisma.orderStatusHistory.create({ data: { orderId: id, status: OrderStatus.delivered } }),
    ]);
  },
};
