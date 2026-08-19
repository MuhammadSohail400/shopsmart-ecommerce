import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import { sendSuccess } from '@shared/utils/response.util';

export const settingsController = {
  async list(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.list());
  },

  async getPublicStoreInfo(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.getPublicStoreInfo());
  },

  async update(req: Request, res: Response) {
    sendSuccess(res, await settingsService.update(req.body.key, req.body.value));
  },

  async updateBulk(req: Request, res: Response) {
    sendSuccess(res, await settingsService.updateBulk(req.body));
  },

  async listTaxRules(_req: Request, res: Response) {
    sendSuccess(res, await settingsService.listTaxRules());
  },

  async createTaxRule(req: Request, res: Response) {
    sendSuccess(res, await settingsService.createTaxRule(req.body), 201);
  },

  async deleteTaxRule(req: Request, res: Response) {
    sendSuccess(res, await settingsService.deleteTaxRule(req.params.id));
  },
};
