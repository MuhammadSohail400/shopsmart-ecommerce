import { Request, Response } from 'express';
import { categoriesService } from './categories.service';
import { sendSuccess } from '@shared/utils/response.util';

export const categoriesController = {
  async list(_req: Request, res: Response) {
    const categories = await categoriesService.list();
    sendSuccess(res, categories);
  },

  async getById(req: Request, res: Response) {
    const category = await categoriesService.getById(req.params.categoryId);
    sendSuccess(res, category);
  },

  async create(req: Request, res: Response) {
    const category = await categoriesService.create(req.body);
    sendSuccess(res, category, 201);
  },

  async update(req: Request, res: Response) {
    const category = await categoriesService.update(req.params.categoryId, req.body);
    sendSuccess(res, category);
  },

  async remove(req: Request, res: Response) {
    await categoriesService.remove(req.params.categoryId);
    res.status(204).send();
  },
};
