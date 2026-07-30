import { Request, Response } from 'express';
import { inventoryService } from './inventory.service';
import { sendSuccess } from '@shared/utils/response.util';
import { ValidationError } from '@shared/errors';

export const inventoryController = {
  async getByVariantId(req: Request, res: Response) {
    const inventory = await inventoryService.getByVariantId(req.params.variantId);
    sendSuccess(res, inventory);
  },

  async update(req: Request, res: Response) {
    const ifMatch = req.header('If-Match');
    if (ifMatch === undefined || Number.isNaN(Number(ifMatch))) {
      throw new ValidationError('If-Match header with the current version is required', [
        { field: 'If-Match', message: 'Required header missing or invalid' },
      ]);
    }
    const inventory = await inventoryService.update(req.params.variantId, Number(ifMatch), req.body);
    sendSuccess(res, inventory);
  },

  async listLowStock(_req: Request, res: Response) {
    sendSuccess(res, await inventoryService.listLowStock());
  },
};
