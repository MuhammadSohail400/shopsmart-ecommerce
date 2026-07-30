import { couponsRepository } from './coupons.repository';
import { NotFoundError, BusinessRuleError, ConflictError } from '@shared/errors';
import { DiscountType } from '@prisma/client';
import type { CreateCouponBody } from './coupons.validators';

export const couponsService = {
  async create(data: CreateCouponBody) {
    const existing = await couponsRepository.findByCode(data.code);
    if (existing) throw new ConflictError('COUPON_CODE_EXISTS', 'A coupon with this code already exists');
    return couponsRepository.create({ ...data, discountType: data.discountType as DiscountType });
  },

  async update(id: string, data: Record<string, unknown>) {
    const existing = await couponsRepository.findById(id);
    if (!existing) throw new NotFoundError('Coupon');
    return couponsRepository.update(id, data);
  },

  async deactivate(id: string) {
    const existing = await couponsRepository.findById(id);
    if (!existing) throw new NotFoundError('Coupon');
    await couponsRepository.deactivate(id);
  },

  /**
   * BR-003: valid only if unexpired, min order value met, and per-user
   * usage limit not exceeded. Returns the computed discount amount.
   * Called from both the coupon-validate endpoint and Cart module
   * (Backend Standards Section 4: coupons never touches Cart/Order directly).
   */
  async validateAndCompute(code: string, cartSubtotal: number, userId?: string): Promise<{
    coupon: Awaited<ReturnType<typeof couponsRepository.findByCode>>;
    discountAmount: number;
  }> {
    const coupon = await couponsRepository.findByCode(code);
    if (!coupon) throw new NotFoundError('Coupon');

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BusinessRuleError('COUPON_EXPIRED', 'This coupon is not currently active');
    }

    if (cartSubtotal < Number(coupon.minOrderValue)) {
      throw new BusinessRuleError(
        'MIN_ORDER_VALUE_NOT_MET',
        `This coupon requires a minimum order of ${coupon.minOrderValue}`,
      );
    }

    if (userId && coupon.usageLimitPerUser) {
      const usedCount = await couponsRepository.countRedemptionsByUser(coupon.id, userId);
      if (usedCount >= coupon.usageLimitPerUser) {
        throw new BusinessRuleError(
          'COUPON_USAGE_LIMIT_EXCEEDED',
          "You've already used this coupon the maximum number of times",
        );
      }
    }

    const discountAmount =
      coupon.discountType === DiscountType.percentage
        ? Math.round(cartSubtotal * (Number(coupon.discountValue) / 100) * 100) / 100
        : Number(coupon.discountValue);

    return { coupon, discountAmount: Math.min(discountAmount, cartSubtotal) };
  },

  // BR-013: non-stackable by default — recorded once at order confirmation (Phase 5)
  async recordRedemption(
    couponId: string,
    orderId: string,
    discountApplied: number,
    userId?: string,
    tx?: import('@prisma/client').Prisma.TransactionClient,
  ) {
    return couponsRepository.recordRedemption({ couponId, orderId, discountApplied, userId }, tx);
  },
};
