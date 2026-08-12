import { Request, Response } from 'express';
import { reviewsService } from './reviews.service';
import { sendSuccess } from '@shared/utils/response.util';

export const reviewsController = {
  async listForProduct(req: Request, res: Response) {
    const { cursor, limit } = req.query as unknown as { cursor?: string; limit: number };
    const { items, nextCursor, hasMore, averageRating, reviewCount } = await reviewsService.listForProduct(
      String(req.params.productId),
      cursor,
      limit,
    );

    res.status(200).json({
      success: true,
      data: items,
      pagination: { nextCursor, hasMore, limit },
      ratingSummary: { averageRating, reviewCount },
      meta: { requestId: res.locals.requestId, timestamp: new Date().toISOString() },
    });
  },

  async create(req: Request, res: Response) {
    const review = await reviewsService.create(req.user!.id, String(req.params.productId), req.body);
    sendSuccess(res, review, 201);
  },

  async moderate(req: Request, res: Response) {
    await reviewsService.moderate(String(req.params.reviewId));
    res.status(204).send();
  },
};
