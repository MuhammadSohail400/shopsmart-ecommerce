import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess, sendPaginated } from '@shared/utils/response.util';

function resolveRange(query: { startDate?: Date; endDate?: Date }) {
  const endDate = query.endDate ?? new Date();
  const startDate = query.startDate ?? new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // default: last 30 days
  return { startDate, endDate };
}

export const analyticsController = {
  async overview(_req: Request, res: Response) {
    sendSuccess(res, await analyticsService.getOverview());
  },

  async sales(req: Request, res: Response) {
    const { startDate, endDate } = resolveRange(req.query as never);
    sendSuccess(res, await analyticsService.getSalesSummary(startDate, endDate));
  },

  async topProducts(req: Request, res: Response) {
    const { limit } = req.query as unknown as { limit: number };
    sendSuccess(res, await analyticsService.getTopProducts(limit));
  },

  async customers(req: Request, res: Response) {
    const { startDate, endDate } = resolveRange(req.query as never);
    sendSuccess(res, await analyticsService.getCustomerAnalytics(startDate, endDate));
  },

  async abandonedCarts(req: Request, res: Response) {
    const { cursor, limit } = req.query as unknown as { cursor?: string; limit: number };
    const { items, nextCursor, hasMore } = await analyticsService.getAbandonedCarts(cursor, limit);
    sendPaginated(res, items, { nextCursor, hasMore, limit });
  },

  async exportCsv(req: Request, res: Response) {
    const { startDate, endDate } = resolveRange(req.query as never);
    const csv = await analyticsService.exportSalesCsv(startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-export.csv"');
    res.status(200).send(csv);
  },
};
