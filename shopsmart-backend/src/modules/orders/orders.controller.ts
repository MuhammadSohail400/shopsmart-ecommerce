import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { sendSuccess, sendPaginated } from '@shared/utils/response.util';
import { OrderStatus } from '@prisma/client';

export const ordersController = {
  async list(req: Request, res: Response) {
    const query = req.query as unknown as { status?: OrderStatus; cursor?: string; limit: number };
    const { items, nextCursor, hasMore } = await ordersService.list(req.user!, query);
    sendPaginated(res, items, { nextCursor, hasMore, limit: query.limit });
  },

  async getById(req: Request, res: Response) {
    const order = await ordersService.getById(String(req.params.orderId), req.user!);
    sendSuccess(res, order);
  },

  async cancel(req: Request, res: Response) {
    await ordersService.cancel(String(req.params.orderId), req.user!);
    res.status(204).send();
  },

  async confirmDelivery(req: Request, res: Response) {
    await ordersService.confirmDelivery(String(req.params.orderId), req.user!.id);
    res.status(204).send();
  },

  async updateStatus(req: Request, res: Response) {
    await ordersService.updateStatus(String(req.params.orderId), req.body.status, req.user!.id);
    res.status(204).send();
  },

  async quickOrder(req: Request, res: Response) {
    const { customer, items, shippingAmount, notes } = req.body;
    const result = await ordersService.createQuickOrder({
      userId: req.user?.id,
      customer,
      items,
      shippingAmount: Number(shippingAmount || 250),
      notes,
    });
    sendSuccess(res, result, 201);
  },
};
