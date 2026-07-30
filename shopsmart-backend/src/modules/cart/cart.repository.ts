import { prisma } from '@config/database';

export const cartRepository = {
  async findOrCreateForUser(userId: string) {
    const existing = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { productVariant: { include: { product: true, inventory: true } } } } },
    });
    if (existing) return existing;

    return prisma.cart.create({
      data: { userId },
      include: { items: { include: { productVariant: { include: { product: true, inventory: true } } } } },
    });
  },

  findItem(cartId: string, productVariantId: string) {
    return prisma.cartItem.findUnique({
      where: { cartId_productVariantId: { cartId, productVariantId } },
    });
  },

  upsertItem(cartId: string, productVariantId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { cartId_productVariantId: { cartId, productVariantId } },
      update: { quantity },
      create: { cartId, productVariantId, quantity },
    });
  },

  removeItem(cartId: string, productVariantId: string) {
    return prisma.cartItem.delete({
      where: { cartId_productVariantId: { cartId, productVariantId } },
    });
  },

  clearItems(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};
