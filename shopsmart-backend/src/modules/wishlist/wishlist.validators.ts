import { z } from 'zod';
import { uuidSchema } from '@shared/utils/validation-primitives';

export const addWishlistItemSchema = z.object({
  productId: uuidSchema,
});

export const moveToCartSchema = z.object({
  productVariantId: uuidSchema,
  quantity: z.number().int().min(1).default(1),
});
