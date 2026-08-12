import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess } from '@shared/utils/response.util';

export const notificationsController = {
  async getPreference(req: Request, res: Response) {
    sendSuccess(res, await notificationsService.getPreference(req.user!.id));
  },

  async updatePreference(req: Request, res: Response) {
    sendSuccess(res, await notificationsService.updatePreference(req.user!.id, req.body.marketingEmailsOptIn));
  },

  async listLogs(req: Request, res: Response) {
    sendSuccess(res, await notificationsService.listLogs(req.query as never));
  },
};
