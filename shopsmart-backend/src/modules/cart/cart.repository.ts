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

  async updateItemQuantity(cartId: string, itemIdentifier: string, quantity: number) {
    // 1. Try finding by cartItem.id
    const byId = await prisma.cartItem.findFirst({
      where: { id: itemIdentifier, cartId },
    });
    if (byId) {
      return prisma.cartItem.update({
        where: { id: byId.id },
        data: { quantity },
      });
    }

    // 2. Try finding by productVariantId
    const byVariant = await prisma.cartItem.findFirst({
      where: { productVariantId: itemIdentifier, cartId },
    });
    if (byVariant) {
      return prisma.cartItem.update({
        where: { id: byVariant.id },
        data: { quantity },
      });
    }
  },

  async removeItem(cartId: string, itemIdentifier: string) {
    // 1. Try finding by cartItem.id
    const byId = await prisma.cartItem.findFirst({
      where: { id: itemIdentifier, cartId },
    });
    if (byId) {
      return prisma.cartItem.delete({
        where: { id: byId.id },
      });
    }

    // 2. Try finding by productVariantId
    const byVariant = await prisma.cartItem.findFirst({
      where: { productVariantId: itemIdentifier, cartId },
    });
    if (byVariant) {
      return prisma.cartItem.delete({
        where: { id: byVariant.id },
      });
    }
  },

  clearItems(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};
