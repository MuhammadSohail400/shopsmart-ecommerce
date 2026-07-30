import { z } from 'zod';

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'disputed', 'refunded']),
});

export const listOrdersQuerySchema = z.object({
  status: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
