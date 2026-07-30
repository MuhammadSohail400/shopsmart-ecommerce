import { z } from 'zod';
import { slugSchema } from '@shared/utils/validation-primitives';

export const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema,
});
export type CreateBrandBody = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = createBrandSchema.partial();
