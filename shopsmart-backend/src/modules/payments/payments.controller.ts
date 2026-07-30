import { Request, Response } from 'express';
import { paymentsService } from './payments.service';
import { sendSuccess } from '@shared/utils/response.util';
import { ValidationError } from '@shared/errors';
import { logger } from '@config/logger';

export const paymentsController = {
  async listByOrder(req: Request, res: Response) {
    sendSuccess(res, await paymentsService.listByOrder(String(req.params.orderId)));
  },

  async issueRefund(req: Request, res: Response) {
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      throw new ValidationError('Idempotency-Key header is required for refunds', [
        { field: 'Idempotency-Key', message: 'Required header missing' },
      ]);
    }
    const refund = await paymentsService.issueRefund(
      String(req.params.orderId),
      req.body.amount,
      req.body.reason,
      idempotencyKey,
    );
    sendSuccess(res, refund, 201);
  },

  /**
   * Requires `req.body` to be the raw Buffer (see app.ts — this route is
   * mounted with express.raw() before the global express.json() parser,
   * since Stripe's signature verification needs the exact raw payload).
   */
  async stripeWebhook(req: Request, res: Response) {
    const signature = req.header('Stripe-Signature');
    if (!signature) {
      res.status(400).json({ received: false, error: 'Missing Stripe-Signature header' });
      return;
    }

    try {
      await paymentsService.handleStripeWebhookEvent(req.body as Buffer, signature);
      res.status(200).json({ received: true });
    } catch (err) {
      // Webhook signature failures are logged but return 400 (not 500) so
      // Stripe doesn't endlessly retry a request that will never succeed.
      logger.warn({ err }, 'Stripe webhook verification/processing failed');
      res.status(400).json({ received: false });
    }
  },
};
