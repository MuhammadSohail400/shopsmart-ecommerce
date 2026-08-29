import { prisma } from '@config/database';
import { OrderStatus, Prisma } from '@prisma/client';
import type { CreateOrderInput } from './orders.types';

export const ordersRepository = {
  /**
   * Creates the Order + OrderItems + initial "pending" status history row.
   */
  async createPending(orderNumber: string, input: CreateOrderInput) {
    return prisma.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        addressId: input.addressId,
        shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
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
            customConfig: i.customConfig ? (i.customConfig as Prisma.InputJsonValue) : undefined,
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
      include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: { 
                  include: { images: true } 
                } 
              } 
            } 
          } 
        }, 
        statusHistory: { orderBy: { changedAt: 'asc' } }, 
        shipment: true 
      },
    });
  },

  findByOrderNumberOrId(query: string) {
    return prisma.order.findFirst({
      where: {
        OR: [
          { id: query },
          { orderNumber: query },
          { orderNumber: { equals: query, mode: 'insensitive' } },
        ],
      },
      include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: { 
                  include: { images: true } 
                } 
              } 
            } 
          } 
        }, 
        statusHistory: { orderBy: { changedAt: 'asc' } }, 
        shipment: true 
      },
    });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: { 
                  include: { images: true } 
                } 
              } 
            } 
          } 
        }, 
        statusHistory: { orderBy: { changedAt: 'asc' } }, 
        shipment: true 
      },
    });
  },

  async list(filters: { userId?: string; status?: OrderStatus; cursor?: string; limit: number }) {
    const where: Prisma.OrderWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));

    const items = await prisma.order.findMany({
      where,
      take: limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: { 
                  include: { images: true } 
                } 
              } 
            } 
          } 
        } 
      },
    });
    const hasMore = items.length > limit;
    return { items: items.slice(0, limit), hasMore };
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
