import { Request, Response } from 'express';
import { brandsService } from './brands.service';
import { sendSuccess } from '@shared/utils/response.util';

export const brandsController = {
  async list(_req: Request, res: Response) {
    sendSuccess(res, await brandsService.list());
  },
  async getById(req: Request, res: Response) {
    sendSuccess(res, await brandsService.getById(req.params.brandId));
  },
  async create(req: Request, res: Response) {
    sendSuccess(res, await brandsService.create(req.body), 201);
  },
  async update(req: Request, res: Response) {
    sendSuccess(res, await brandsService.update(req.params.brandId, req.body));
  },
  async remove(req: Request, res: Response) {
    await brandsService.remove(req.params.brandId);
    res.status(204).send();
  },
};
