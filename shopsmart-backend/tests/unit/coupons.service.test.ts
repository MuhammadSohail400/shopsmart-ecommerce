import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/modules/coupons/coupons.repository', () => ({
  couponsRepository: {
    findByCode: vi.fn(),
    countRedemptionsByUser: vi.fn(),
    create: vi.fn(),
    recordRedemption: vi.fn(),
  },
}));

vi.mock('@modules/audit-logs', () => ({ recordAuditLog: vi.fn() }));

import { couponsRepository } from '../../src/modules/coupons/coupons.repository';
import { couponsService } from '../../src/modules/coupons/coupons.service';

function makeCoupon(overrides: Partial<Record<string, unknown>> = {}) {
  const now = new Date();
  return {
    id: 'coupon-1',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 100,
    usageLimitPerUser: 2,
    startDate: new Date(now.getTime() - 86_400_000),
    endDate: new Date(now.getTime() + 86_400_000),
    ...overrides,
  };
}

describe('couponsService.validateAndCompute (BR-003)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('computes a percentage discount correctly', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(makeCoupon());
    (couponsRepository.countRedemptionsByUser as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const { discountAmount } = await couponsService.validateAndCompute('SAVE20', 500, 'user-1');
    expect(discountAmount).toBe(100); // 20% of 500
  });

  it('computes a flat discount correctly', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeCoupon({ discountType: 'flat', discountValue: 50 }),
    );
    (couponsRepository.countRedemptionsByUser as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const { discountAmount } = await couponsService.validateAndCompute('SAVE20', 500, 'user-1');
    expect(discountAmount).toBe(50);
  });

  it('caps the discount at the cart subtotal (never a negative order total)', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeCoupon({ discountType: 'flat', discountValue: 999, minOrderValue: 0 }),
    );
    (couponsRepository.countRedemptionsByUser as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const { discountAmount } = await couponsService.validateAndCompute('SAVE20', 50, 'user-1');
    expect(discountAmount).toBe(50); // capped, not 999
  });

  it('throws COUPON_EXPIRED for a coupon past its end date', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeCoupon({ endDate: new Date(Date.now() - 1000) }),
    );

    await expect(couponsService.validateAndCompute('SAVE20', 500, 'user-1')).rejects.toMatchObject({
      code: 'COUPON_EXPIRED',
    });
  });

  it('throws COUPON_EXPIRED for a coupon not yet started', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeCoupon({ startDate: new Date(Date.now() + 86_400_000) }),
    );

    await expect(couponsService.validateAndCompute('SAVE20', 500, 'user-1')).rejects.toMatchObject({
      code: 'COUPON_EXPIRED',
    });
  });

  it('throws MIN_ORDER_VALUE_NOT_MET when the cart subtotal is below the minimum', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(makeCoupon({ minOrderValue: 1000 }));

    await expect(couponsService.validateAndCompute('SAVE20', 500, 'user-1')).rejects.toMatchObject({
      code: 'MIN_ORDER_VALUE_NOT_MET',
    });
  });

  it('throws COUPON_USAGE_LIMIT_EXCEEDED once the per-user limit is reached', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(makeCoupon({ usageLimitPerUser: 1 }));
    (couponsRepository.countRedemptionsByUser as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    await expect(couponsService.validateAndCompute('SAVE20', 500, 'user-1')).rejects.toMatchObject({
      code: 'COUPON_USAGE_LIMIT_EXCEEDED',
    });
  });

  it('skips the usage-limit check entirely for guest checkout (no userId)', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(makeCoupon({ usageLimitPerUser: 1 }));

    const { discountAmount } = await couponsService.validateAndCompute('SAVE20', 500, undefined);
    expect(discountAmount).toBe(100);
    expect(couponsRepository.countRedemptionsByUser).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND for an unknown coupon code', async () => {
    (couponsRepository.findByCode as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(couponsService.validateAndCompute('DOESNOTEXIST', 500)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
