import { Request, Response } from 'express';
import { newsletterService } from './newsletter.service';
import { sendSuccess } from '@shared/utils/response.util';

export const newsletterController = {
  async subscribe(req: Request, res: Response) {
    const result = await newsletterService.subscribe(req.body.email);
    sendSuccess(res, result, 200);
  },
};
