import { z } from 'zod';
import { slugSchema, uuidSchema, moneySchema, cursorPaginationSchema } from '@shared/utils/validation-primitives';

// VR-007/VR-008: title, price, category, image required; price positive
export const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  description: z.string().min(1),
  basePrice: moneySchema,
  categoryId: uuidSchema,
  brandId: uuidSchema.optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
});
export type CreateProductBody = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
});

export const listProductsQuerySchema = cursorPaginationSchema.extend({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.string().optional(),
});

// VR-010: variant attribute combos must be unique per product (enforced by
// the DB unique constraint too; this is the request-shape check)
export const createVariantSchema = z.object({
  sku: z.string().min(1).max(64),
  attributes: z.record(z.string()),
  priceModifier: z.number().default(0),
  initialStock: z.number().int().min(0).default(0),
});
export type CreateVariantBody = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = z.object({
  sku: z.string().min(1).max(64).optional(),
  attributes: z.record(z.string()).optional(),
  priceModifier: z.number().optional(),
});

export const addImageSchema = z.object({
  url: z.string().url(),
  sortOrder: z.number().int().min(0).default(0),
});
export type AddImageBody = z.infer<typeof addImageSchema>;

export const reorderImageSchema = z.object({
  sortOrder: z.number().int().min(0),
});
