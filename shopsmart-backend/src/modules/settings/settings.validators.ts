import { z } from 'zod';

export const updateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const createTaxRuleSchema = z.object({
  country: z.string().length(2),
  region: z.string().optional(),
  rate: z.number().min(0).max(1), // 0.0825 = 8.25%
});
export type CreateTaxRuleBody = z.infer<typeof createTaxRuleSchema>;
