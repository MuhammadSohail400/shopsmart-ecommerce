import { z } from 'zod';

/**
 * Reusable Zod primitives so format rules (VR-xxx, SRS Section 8) are
 * defined once and shared across every module's validators
 * (Backend Standards Section 9.2).
 */
export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email().toLowerCase(); // VR-003

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number format'); // VR-004

// VR-001 / VR-002: min 8 chars, at least 1 upper, 1 lower, 1 number
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const moneySchema = z.number().nonnegative();

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a URL-friendly slug');

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
