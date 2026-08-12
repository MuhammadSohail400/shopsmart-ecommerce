import { z } from 'zod';
import { slugSchema } from '@shared/utils/validation-primitives';

export const createPageSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(255),
  body: z.string().min(1),
});
export type CreatePageBody = z.infer<typeof createPageSchema>;
export const updatePageSchema = createPageSchema.partial();

export const createBannerSchema = z.object({
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateBannerBody = z.infer<typeof createBannerSchema>;

export const createFaqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateFaqBody = z.infer<typeof createFaqSchema>;

export const updateBannerSchema = createBannerSchema.partial();
export const updateFaqSchema = createFaqSchema.partial();
