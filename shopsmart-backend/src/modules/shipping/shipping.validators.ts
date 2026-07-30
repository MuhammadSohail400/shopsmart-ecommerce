import { z } from 'zod';
import { uuidSchema, moneySchema } from '@shared/utils/validation-primitives';

export const createZoneSchema = z.object({
  name: z.string().min(1).max(255),
  countries: z.array(z.string().length(2)).min(1), // ISO country codes, e.g. "PK"
});
export type CreateZoneBody = z.infer<typeof createZoneSchema>;

export const createRateSchema = z.object({
  zoneId: uuidSchema,
  method: z.enum(['standard', 'express']),
  cost: moneySchema,
  etaDays: z.number().int().positive(),
});
export type CreateRateBody = z.infer<typeof createRateSchema>;

export const calculateShippingSchema = z.object({
  country: z.string().length(2),
  method: z.enum(['standard', 'express']),
});
