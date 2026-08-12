import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendPaginated } from '@shared/utils/response.util';

export const adminController = {
  async getDashboardSummary(_req: Request, res: Response) {
    sendSuccess(res, await adminService.getDashboardSummary());
  },

  async listOrders(req: Request, res: Response) {
    const query = req.query as unknown as { status?: string; cursor?: string; limit: number };
    const { items, nextCursor, hasMore } = await adminService.listOrders(req.user!, query);
    sendPaginated(res, items, { nextCursor, hasMore, limit: query.limit });
  },

  async listStaff(_req: Request, res: Response) {
    sendSuccess(res, await adminService.listStaff());
  },

  async createStaff(req: Request, res: Response) {
    sendSuccess(res, await adminService.createStaff(req.body, req.user?.id), 201);
  },

  async updateStaffRole(req: Request, res: Response) {
    const updated = await adminService.updateStaffRole(
      String(req.params.staffId),
      req.body.role,
      req.user?.id,
    );
    sendSuccess(res, updated);
  },
};
