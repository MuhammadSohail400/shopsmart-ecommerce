import { prisma } from '@config/database';

export const reviewsRepository = {
  async listForProduct(productId: string, cursor: string | undefined, limit: number) {
    const items = await prisma.review.findMany({
      where: { productId, hidden: false, deletedAt: null },
      include: { user: { select: { id: true, email: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > limit;
    return { items: items.slice(0, limit), hasMore };
  },

  async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const result = await prisma.review.aggregate({
      where: { productId, hidden: false, deletedAt: null },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: result._avg.rating ?? 0, count: result._count.rating };
  },

  findExisting(orderId: string, productId: string, userId: string) {
    return prisma.review.findUnique({
      where: { orderId_productId_userId: { orderId, productId, userId } },
    });
  },

  create(data: { orderId: string; productId: string; userId: string; rating: number; comment?: string }) {
    return prisma.review.create({ data });
  },

  findById(id: string) {
    return prisma.review.findFirst({ where: { id, deletedAt: null } });
  },

  hide(id: string) {
    return prisma.review.update({ where: { id }, data: { hidden: true } });
  },
};
