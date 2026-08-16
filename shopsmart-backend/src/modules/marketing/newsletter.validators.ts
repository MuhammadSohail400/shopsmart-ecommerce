import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export type SubscribeNewsletterBody = z.infer<typeof subscribeNewsletterSchema>;
