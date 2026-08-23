import { Request, Response } from 'express';
import { cartService } from './cart.service';
import { sendSuccess } from '@shared/utils/response.util';
import { ValidationError } from '@shared/errors';

function getContext(req: Request): { userId?: string; guestCartId?: string } {
  const guestCartId = req.header('X-Guest-Cart-Id');
  if (!req.user && !guestCartId) {
    throw new ValidationError('Either authentication or X-Guest-Cart-Id header is required', [
      { field: 'X-Guest-Cart-Id', message: 'Required for guest cart operations' },
    ]);
  }
  return { userId: req.user?.id, guestCartId };
}

export const cartController = {
  async getCart(req: Request, res: Response) {
    const view = await cartService.getCart(getContext(req));
    sendSuccess(res, view);
  },

  async addItem(req: Request, res: Response) {
    const view = await cartService.addItem(
      getContext(req), 
      req.body.productVariantId, 
      req.body.quantity,
      req.body.customConfig
    );
    sendSuccess(res, view, 201);
  },

  async updateItem(req: Request, res: Response) {
    const view = await cartService.updateItemQuantity(
      getContext(req),
      String(req.params.itemId),
      req.body.quantity,
    );
    sendSuccess(res, view);
  },

  async removeItem(req: Request, res: Response) {
    const view = await cartService.removeItem(getContext(req), String(req.params.itemId));
    sendSuccess(res, view);
  },

  async applyCoupon(req: Request, res: Response) {
    const view = await cartService.applyCoupon(getContext(req), req.body.code);
    sendSuccess(res, view);
  },

  async removeCoupon(req: Request, res: Response) {
    const view = await cartService.removeCoupon(getContext(req));
    sendSuccess(res, view);
  },

  async mergeCart(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new ValidationError('Authentication required for merging cart');
    }
    const guestCartId = req.body?.guestCartId || req.header('X-Guest-Cart-Id');
    if (!guestCartId) {
      const view = await cartService.getCart({ userId: req.user.id });
      sendSuccess(res, view);
      return;
    }
    const view = await cartService.mergeGuestCart(req.user.id, guestCartId);
    sendSuccess(res, view);
  },

  async clearCart(req: Request, res: Response) {
    await cartService.clear(getContext(req));
    res.status(204).send();
  },
};
