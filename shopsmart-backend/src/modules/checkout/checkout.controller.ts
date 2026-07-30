import { Request, Response } from 'express';
import { checkoutService } from './checkout.service';
import { sendSuccess } from '@shared/utils/response.util';
import { ValidationError } from '@shared/errors';

function getContext(req: Request): { userId?: string; guestCartId?: string } {
  const guestCartId = req.header('X-Guest-Cart-Id');
  if (!req.user && !guestCartId) {
    throw new ValidationError('Either authentication or X-Guest-Cart-Id header is required', [
      { field: 'X-Guest-Cart-Id', message: 'Required for guest checkout' },
    ]);
  }
  return { userId: req.user?.id, guestCartId };
}

export const checkoutController = {
  async createSession(req: Request, res: Response) {
    const preview = await checkoutService.createSession(getContext(req), req.body);
    sendSuccess(res, preview, 201);
  },

  async getSession(req: Request, res: Response) {
    // Session detail is a thin re-read; reusing createSession's shape isn't
    // needed here since the session is already persisted with its totals.
    const { checkoutRepository } = await import('./checkout.repository');
    const session = await checkoutRepository.findById(String(req.params.sessionId));
    sendSuccess(res, session);
  },

  async confirm(req: Request, res: Response) {
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      throw new ValidationError('Idempotency-Key header is required to confirm checkout', [
        { field: 'Idempotency-Key', message: 'Required header missing' },
      ]);
    }

    const result = await checkoutService.confirm(
      getContext(req),
      String(req.params.sessionId),
      req.body,
      idempotencyKey,
    );
    res.setHeader('Location', `/api/v1/orders/${result.order.id}`);
    sendSuccess(res, result, 201);
  },
};
