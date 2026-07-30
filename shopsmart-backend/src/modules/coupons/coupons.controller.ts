import { Request, Response } from 'express';
import { couponsService } from './coupons.service';
import { sendSuccess } from '@shared/utils/response.util';

export const couponsController = {
  async create(req: Request, res: Response) {
    sendSuccess(res, await couponsService.create(req.body), 201);
  },

  async update(req: Request, res: Response) {
    sendSuccess(res, await couponsService.update(req.params.couponId, req.body));
  },

  async deactivate(req: Request, res: Response) {
    await couponsService.deactivate(req.params.couponId);
    res.status(204).send();
  },

  async validate(req: Request, res: Response) {
    const { code, cartSubtotal } = req.body;
    const { coupon, discountAmount } = await couponsService.validateAndCompute(
      code,
      cartSubtotal,
      req.user?.id,
    );
    sendSuccess(res, { code: coupon!.code, discountAmount });
  },
};
