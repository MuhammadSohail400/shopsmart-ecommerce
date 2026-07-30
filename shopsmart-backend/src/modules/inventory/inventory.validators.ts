import { z } from 'zod';

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0).optional(), // BR-001: never negative
  lowStockThreshold: z.number().int().min(0).optional(),
});
export type UpdateInventoryBody = z.infer<typeof updateInventorySchema>;
