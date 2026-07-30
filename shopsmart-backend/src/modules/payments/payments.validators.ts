import { z } from 'zod';
import { moneySchema } from '@shared/utils/validation-primitives';

export const issueRefundSchema = z.object({
  amount: moneySchema,
  reason: z.string().max(500).optional(),
});
