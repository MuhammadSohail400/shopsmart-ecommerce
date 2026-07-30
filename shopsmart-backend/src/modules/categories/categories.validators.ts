import { z } from 'zod';
import { slugSchema, uuidSchema } from '@shared/utils/validation-primitives';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema,
  parentId: uuidSchema.optional(),
});
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
