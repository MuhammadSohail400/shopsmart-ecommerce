import { prisma } from '@config/database';
import { OrderStatus } from '@prisma/client';

const COMPLETED_STATUSES: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];

export const analyticsRepository = {
  async salesSummary(startDate: Date, endDate: Date) {
    const result = await prisma.order.aggregate({
      where: { status: { in: COMPLETED_STATUSES }, createdAt: { gte: startDate, lte: endDate } },
      _sum: { totalAmount: true },
      _count: { id: true },
    });
    const count = result._count?.id ?? 0;
    const revenue = Number(result._sum?.totalAmount ?? 0);
    return {
      totalRevenue: revenue,
      orderCount: count,
      averageOrderValue: count > 0 ? revenue / count : 0,
    };
  },

  async topProducts(limit: number) {
    const grouped = await prisma.orderItem.groupBy({
      by: ['productVariantId'],
      _sum: { quantity: true, priceAtPurchase: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const variantIds = grouped.map((g) => g.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { id: true, title: true } } },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    return grouped.map((g) => ({
      productVariantId: g.productVariantId,
      productTitle: variantMap.get(g.productVariantId)?.product.title ?? 'Unknown',
      unitsSold: g._sum.quantity ?? 0,
      revenue: Number(g._sum.priceAtPurchase ?? 0) * (g._sum.quantity ?? 0),
    }));
  },

  async customerGrowth(startDate: Date, endDate: Date) {
    const newCustomers = await prisma.user.count({
      where: { role: 'customer', createdAt: { gte: startDate, lte: endDate }, deletedAt: null },
    });
    const totalCustomers = await prisma.user.count({ where: { role: 'customer', deletedAt: null } });
    return { newCustomers, totalCustomers };
  },

  async repeatCustomerRate() {
    const grouped = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { not: null } },
      _count: { id: true },
    });
    const total = grouped.length;
    const repeat = grouped.filter((g) => (g._count?.id ?? 0) >= 2).length;
    return total > 0 ? repeat / total : 0;
  },

  async abandonedCarts(cursor: string | undefined, limit: number) {
    const items = await prisma.abandonedCartSnapshot.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > limit;
    return { items: items.slice(0, limit), hasMore };
  },

  createAbandonedCartSnapshot(data: { userId?: string; cartItems: object; subtotal: number }) {
    return prisma.abandonedCartSnapshot.create({ data });
  },
};
