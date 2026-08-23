import { prisma } from '@config/database';
import { Prisma } from '@prisma/client';

export const cartRepository = {
  async findOrCreateForUser(userId: string) {
    const existing = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { productVariant: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } }, inventory: true } } } } },
    });
    if (existing) return existing;

    return prisma.cart.create({
      data: { userId },
      include: { items: { include: { productVariant: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } }, inventory: true } } } } },
    });
  },

  findItem(cartId: string, productVariantId: string) {
    return prisma.cartItem.findFirst({
      where: { cartId, productVariantId },
    });
  },

  async upsertItem(cartId: string, productVariantId: string, quantity: number, customConfig?: any) {
    if (customConfig) {
      const existing = await prisma.cartItem.findFirst({
        where: { cartId, productVariantId, customConfig: { not: Prisma.DbNull } },
      });
      if (existing) {
        return prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity, customConfig: customConfig as Prisma.InputJsonValue },
        });
      }
      return prisma.cartItem.create({
        data: { cartId, productVariantId, quantity, customConfig: customConfig as Prisma.InputJsonValue },
      });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { cartId, productVariantId, customConfig: { equals: Prisma.DbNull } },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity },
      });
    }

    return prisma.cartItem.create({
      data: { cartId, productVariantId, quantity },
    });
  },

  async removeItem(cartId: string, productVariantId: string) {
    const items = await prisma.cartItem.findMany({
      where: { cartId, productVariantId },
      take: 1,
    });
    if (items.length > 0) {
      return prisma.cartItem.delete({
        where: { id: items[0].id },
      });
    }
  },

  clearItems(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};
