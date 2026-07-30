import { prisma } from '@config/database';

export const wishlistRepository = {
  async findOrCreateForUser(userId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
    if (existing) return existing;
    return prisma.wishlist.create({
      data: { userId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  },

  findItem(wishlistId: string, productId: string) {
    return prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId, productId } },
    });
  },

  addItem(wishlistId: string, productId: string) {
    return prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId, productId } },
      update: {},
      create: { wishlistId, productId },
    });
  },

  removeItem(wishlistId: string, productId: string) {
    return prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId, productId } },
    });
  },
};
