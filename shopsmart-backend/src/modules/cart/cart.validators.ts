import { z } from 'zod';
import { uuidSchema } from '@shared/utils/validation-primitives';
import { MAX_ORDER_QUANTITY_PER_SKU } from '@shared/constants/limits';

// BR-008: max quantity per SKU per order (enforced here at cart-add time too,
// since the cart is what checkout is built from)
export const addCartItemSchema = z.object({
  productVariantId: uuidSchema,
  quantity: z.number().int().min(1).max(MAX_ORDER_QUANTITY_PER_SKU),
});
export type AddCartItemBody = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(MAX_ORDER_QUANTITY_PER_SKU),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1),
});
