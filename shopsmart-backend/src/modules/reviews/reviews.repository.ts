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

  updateStatus(id: string, hidden: boolean) {
    return prisma.review.update({
      where: { id },
      data: { hidden },
      include: {
        product: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, email: true } },
      },
    });
  },

  deleteReview(id: string) {
    return prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async listAllForAdmin(params: {
    page?: number;
    limit?: number;
    status?: 'all' | 'published' | 'hidden';
    rating?: number;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (params.status === 'published') {
      where.hidden = false;
    } else if (params.status === 'hidden') {
      where.hidden = true;
    }

    if (params.rating && params.rating >= 1 && params.rating <= 5) {
      where.rating = params.rating;
    }

    if (params.search) {
      where.OR = [
        { comment: { contains: params.search, mode: 'insensitive' } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        { product: { title: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: { select: { id: true, title: true, slug: true, images: { take: 1 } } },
          user: { select: { id: true, email: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getModerationStats() {
    const [total, published, hidden, ratingAgg] = await Promise.all([
      prisma.review.count({ where: { deletedAt: null } }),
      prisma.review.count({ where: { hidden: false, deletedAt: null } }),
      prisma.review.count({ where: { hidden: true, deletedAt: null } }),
      prisma.review.aggregate({
        where: { deletedAt: null },
        _avg: { rating: true },
      }),
    ]);

    return {
      total,
      published,
      hidden,
      averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 5.0,
    };
  },
};

