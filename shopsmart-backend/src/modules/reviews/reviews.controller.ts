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

  async adminList(req: Request, res: Response) {
    const { page, limit, status, rating, search } = req.query as {
      page?: string;
      limit?: string;
      status?: 'all' | 'published' | 'hidden';
      rating?: string;
      search?: string;
    };

    const result = await reviewsService.adminList({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status: status || 'all',
      rating: rating ? parseInt(rating, 10) : undefined,
      search,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      meta: { requestId: res.locals.requestId, timestamp: new Date().toISOString() },
    });
  },

  async adminUpdateStatus(req: Request, res: Response) {
    const { hidden } = req.body as { hidden: boolean };
    const updated = await reviewsService.adminUpdateStatus(String(req.params.reviewId), Boolean(hidden));
    sendSuccess(res, updated, 200);
  },

  async adminGetStats(_req: Request, res: Response) {
    const stats = await reviewsService.adminGetStats();
    sendSuccess(res, stats, 200);
  },

  async adminDelete(req: Request, res: Response) {
    await reviewsService.adminDelete(String(req.params.reviewId));
    res.status(204).send();
  },
};

