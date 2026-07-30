import { Request, Response } from 'express';
import { wishlistService } from './wishlist.service';
import { sendSuccess } from '@shared/utils/response.util';

export const wishlistController = {
  async getWishlist(req: Request, res: Response) {
    sendSuccess(res, await wishlistService.getWishlist(req.user!.id));
  },

  async addItem(req: Request, res: Response) {
    sendSuccess(res, await wishlistService.addItem(req.user!.id, req.body.productId), 201);
  },

  async removeItem(req: Request, res: Response) {
    await wishlistService.removeItem(req.user!.id, String(req.params.productId));
    res.status(204).send();
  },

  async moveToCart(req: Request, res: Response) {
    await wishlistService.moveToCart(
      req.user!.id,
      String(req.params.productId),
      req.body.productVariantId,
      req.body.quantity,
    );
    res.status(204).send();
  },
};
