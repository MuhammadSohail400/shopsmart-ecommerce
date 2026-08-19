import { Request, Response } from 'express';
import { contactService } from './contact.service';
import { sendSuccess } from '@shared/utils/response.util';

export const contactController = {
  async submit(req: Request, res: Response) {
    const result = await contactService.submitMessage(req.body);
    sendSuccess(res, result, 201);
  },

  async list(req: Request, res: Response) {
    const status = req.query.status as string | undefined;
    const messages = await contactService.listMessages(status);
    sendSuccess(res, messages);
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await contactService.updateMessageStatus(id, status);
    sendSuccess(res, updated);
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await contactService.deleteMessage(id);
    sendSuccess(res, { message: 'Message deleted' });
  },
};
