import { prisma } from '@config/database';
import { DiscountType } from '@prisma/client';

export const couponsRepository = {
  findByCode(code: string) {
    return prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), deletedAt: null },
    });
  },

  findById(id: string) {
    return prisma.coupon.findFirst({ where: { id, deletedAt: null } });
  },

  create(data: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    usageLimitPerUser?: number;
    startDate: Date;
    endDate: Date;
  }) {
    return prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } });
  },

  update(id: string, data: Record<string, unknown>) {
    return prisma.coupon.update({ where: { id }, data });
  },

  deactivate(id: string) {
    return prisma.coupon.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  countRedemptionsByUser(couponId: string, userId: string) {
    return prisma.couponRedemption.count({ where: { couponId, userId } });
  },

  recordRedemption(data: {
    couponId: string;
    userId?: string;
    orderId: string;
    discountApplied: number;
  }) {
    return prisma.couponRedemption.create({ data });
  },
};
