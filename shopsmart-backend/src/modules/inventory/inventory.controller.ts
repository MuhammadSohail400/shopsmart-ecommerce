import { Request, Response } from 'express';
import { inventoryService } from './inventory.service';
import { sendSuccess } from '@shared/utils/response.util';

export const inventoryController = {
  async getByVariantId(req: Request, res: Response) {
    const inventory = await inventoryService.getByVariantId(req.params.variantId);
    sendSuccess(res, inventory);
  },

  async update(req: Request, res: Response) {
    let rawVersion = req.header('If-Match');
    if (rawVersion !== undefined) {
      rawVersion = rawVersion.replace(/"/g, '').trim();
    }

    let versionNum: number;
    if (rawVersion !== undefined && rawVersion !== '' && !Number.isNaN(Number(rawVersion))) {
      versionNum = Number(rawVersion);
    } else if (typeof req.body?.version === 'number') {
      versionNum = req.body.version;
    } else if (typeof req.body?.version === 'string' && !Number.isNaN(Number(req.body.version))) {
      versionNum = Number(req.body.version);
    } else {
      const existing = await inventoryService.getByVariantId(req.params.variantId);
      versionNum = existing.version;
    }

    const { quantity, lowStockThreshold } = req.body;
    const inventory = await inventoryService.update(req.params.variantId, versionNum, {
      quantity,
      lowStockThreshold,
    });
    sendSuccess(res, inventory);
  },

  async listLowStock(_req: Request, res: Response) {
    sendSuccess(res, await inventoryService.listLowStock());
  },
};
