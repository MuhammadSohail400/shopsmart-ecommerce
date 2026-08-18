import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendPaginated } from '@shared/utils/response.util';

export const adminController = {
  async getDashboardSummary(_req: Request, res: Response) {
    sendSuccess(res, await adminService.getDashboardSummary());
  },

  async listOrders(req: Request, res: Response) {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const status = req.query.status as string | undefined;
    const cursor = req.query.cursor as string | undefined;
    const { items, nextCursor, hasMore } = await adminService.listOrders(req.user!, { status, cursor, limit });
    sendPaginated(res, items, { nextCursor, hasMore, limit });
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
