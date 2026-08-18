import { Request, Response } from 'express';
import { productsService } from './products.service';
import { sendSuccess, sendPaginated } from '@shared/utils/response.util';

export const productsController = {
  async list(req: Request, res: Response) {
    const query = req.query as unknown as {
      q?: string;
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
      cursor?: string;
      limit: number;
    };
    const { items, nextCursor, hasMore } = await productsService.list(query);
    sendPaginated(res, items, { nextCursor, hasMore, limit: query.limit });
  },

  async getById(req: Request, res: Response) {
    sendSuccess(res, await productsService.getById(req.params.productId));
  },

  async create(req: Request, res: Response) {
    sendSuccess(res, await productsService.create(req.body, req.user?.id), 201);
  },

  async update(req: Request, res: Response) {
    sendSuccess(res, await productsService.update(req.params.productId, req.body, req.user?.id));
  },

  async remove(req: Request, res: Response) {
    await productsService.archive(req.params.productId, req.user?.id);
    res.status(204).send();
  },

  // --- Variants ---
  async addVariant(req: Request, res: Response) {
    sendSuccess(res, await productsService.addVariant(req.params.productId, req.body), 201);
  },

  async updateVariant(req: Request, res: Response) {
    sendSuccess(
      res,
      await productsService.updateVariant(req.params.productId, req.params.variantId, req.body),
    );
  },

  async removeVariant(req: Request, res: Response) {
    await productsService.removeVariant(req.params.productId, req.params.variantId);
    res.status(204).send();
  },

  // --- Images ---
  async addImage(req: Request, res: Response) {
    sendSuccess(res, await productsService.addImage(req.params.productId, req.body), 201);
  },

  async removeImage(req: Request, res: Response) {
    await productsService.removeImage(req.params.productId, req.params.imageId);
    res.status(204).send();
  },

  async reorderImage(req: Request, res: Response) {
    sendSuccess(
      res,
      await productsService.reorderImage(req.params.productId, req.params.imageId, req.body.sortOrder),
    );
  },
};
