import Stripe from 'stripe';
import { env } from '@config/env';
import { ExternalServiceError } from '@shared/errors';

/**
 * Single file that imports the Stripe SDK directly (Backend Standards
 * Section 13.4 pattern, applied to Payments per Section 4: "sole module
 * allowed to call the Stripe adapter"). Every other file talks to this
 * adapter, never to `stripe` directly.
 */
let stripeClient: Stripe | null = null;

function getClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ExternalServiceError('Stripe is not configured (STRIPE_SECRET_KEY missing)');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export const stripeAdapter = {
  async createPaymentIntent(amount: number, currency: string, idempotencyKey: string, metadata: Record<string, string>) {
    const client = getClient();
    try {
      return await client.paymentIntents.create(
        {
          amount: Math.round(amount * 100), // Stripe expects the smallest currency unit
          currency,
          metadata,
          automatic_payment_methods: { enabled: true },
        },
        { idempotencyKey },
      );
    } catch (err) {
      throw new ExternalServiceError(`Stripe payment intent creation failed: ${(err as Error).message}`);
    }
  },

  async createRefund(paymentIntentId: string, amount: number, idempotencyKey: string) {
    const client = getClient();
    try {
      return await client.refunds.create(
        { payment_intent: paymentIntentId, amount: Math.round(amount * 100) },
        { idempotencyKey },
      );
    } catch (err) {
      throw new ExternalServiceError(`Stripe refund failed: ${(err as Error).message}`);
    }
  },

  /** Webhook signature verification (Section 17.1 of the API Design Specification). */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new ExternalServiceError('Stripe webhook secret is not configured');
    }
    const client = getClient();
    return client.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  },
};
