import { prisma } from '@config/database';
import { v4 as uuidv4 } from 'uuid';

const SESSION_TTL_MINUTES = 30;

export const checkoutRepository = {
  create(data: {
    userId?: string;
    guestCartId?: string;
    addressId?: string;
    guestAddress?: object;
    shippingMethod: string;
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    couponCode?: string;
  }) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60_000);
    return prisma.checkoutSession.create({
      data: { ...data, idempotencyKey: uuidv4(), expiresAt },
    });
  },

  findById(id: string) {
    return prisma.checkoutSession.findUnique({ where: { id } });
  },

  markConfirmed(id: string) {
    return prisma.checkoutSession.update({ where: { id }, data: { status: 'confirmed' } });
  },
};
