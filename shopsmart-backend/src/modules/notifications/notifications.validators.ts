import { z } from 'zod';

export const updatePreferenceSchema = z.object({
  marketingEmailsOptIn: z.boolean(),
});

export const listLogsQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
