import { Request, Response } from 'express';
import { shippingService } from './shipping.service';
import { sendSuccess } from '@shared/utils/response.util';

export const shippingController = {
  async listZones(_req: Request, res: Response) {
    sendSuccess(res, await shippingService.listZones());
  },

  async createZone(req: Request, res: Response) {
    sendSuccess(res, await shippingService.createZone(req.body), 201);
  },

  async createRate(req: Request, res: Response) {
    sendSuccess(res, await shippingService.createRate(req.body), 201);
  },

  async getShipment(req: Request, res: Response) {
    const shipment = await shippingService.getShipmentByOrderId(String(req.params.orderId));
    sendSuccess(res, shipment);
  },
};
