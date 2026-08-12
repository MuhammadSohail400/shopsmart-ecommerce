import { Request, Response } from 'express';
import { auditLogsService } from './audit-logs.service';
import { sendSuccess } from '@shared/utils/response.util';

export const auditLogsController = {
  async list(req: Request, res: Response) {
    sendSuccess(res, await auditLogsService.list(req.query as never));
  },
};
