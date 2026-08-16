import { Request, Response } from 'express';
import { contactService } from './contact.service';
import { sendSuccess } from '@shared/utils/response.util';

export const contactController = {
  async submit(req: Request, res: Response) {
    const result = await contactService.submitMessage(req.body);
    sendSuccess(res, result, 201);
  },
};
