import { z } from 'zod';

// VR-011/012/013
export const createCouponSchema = z
  .object({
    code: z.string().min(1).max(64).toUpperCase(),
    discountType: z.enum(['percentage', 'flat']),
    discountValue: z.number().positive(),
    minOrderValue: z.number().nonnegative().default(0),
    usageLimitPerUser: z.number().int().positive().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  })
  .refine((data) => !(data.discountType === 'percentage' && data.discountValue > 100), {
    message: 'Percentage discount cannot exceed 100',
    path: ['discountValue'],
  });
export type CreateCouponBody = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = z.object({
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().nonnegative().optional(),
  usageLimitPerUser: z.number().int().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  cartSubtotal: z.number().nonnegative(),
});
