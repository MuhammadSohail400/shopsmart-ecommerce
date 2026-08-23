import { Request, Response } from 'express';
import { uploadsService } from './uploads.service';
import { ValidationError } from '@shared/errors';
import { sendSuccess } from '@shared/utils/response.util';

export const uploadsController = {
  async uploadCustomDesign(req: Request, res: Response): Promise<void> {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      throw new ValidationError('Image data (base64 string or data URL) is required.');
    }

    const result = await uploadsService.saveBase64Image(image);
    sendSuccess(res, result, 201);
  },
};
