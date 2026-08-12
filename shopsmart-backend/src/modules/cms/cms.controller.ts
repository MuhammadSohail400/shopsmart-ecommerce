import { Request, Response } from 'express';
import { cmsService } from './cms.service';
import { sendSuccess } from '@shared/utils/response.util';

export const cmsController = {
  async getPageBySlug(req: Request, res: Response) {
    sendSuccess(res, await cmsService.getPageBySlug(String(req.params.slug)));
  },
  async createPage(req: Request, res: Response) {
    sendSuccess(res, await cmsService.createPage(req.body), 201);
  },
  async updatePage(req: Request, res: Response) {
    sendSuccess(res, await cmsService.updatePage(String(req.params.pageId), req.body));
  },

  async listBanners(_req: Request, res: Response) {
    sendSuccess(res, await cmsService.listActiveBanners());
  },
  async createBanner(req: Request, res: Response) {
    sendSuccess(res, await cmsService.createBanner(req.body), 201);
  },
  async updateBanner(req: Request, res: Response) {
    sendSuccess(res, await cmsService.updateBanner(String(req.params.bannerId), req.body));
  },
  async removeBanner(req: Request, res: Response) {
    await cmsService.removeBanner(String(req.params.bannerId));
    res.status(204).send();
  },

  async listFaq(_req: Request, res: Response) {
    sendSuccess(res, await cmsService.listFaq());
  },
  async createFaq(req: Request, res: Response) {
    sendSuccess(res, await cmsService.createFaq(req.body), 201);
  },
  async updateFaq(req: Request, res: Response) {
    sendSuccess(res, await cmsService.updateFaq(String(req.params.faqId), req.body));
  },
  async removeFaq(req: Request, res: Response) {
    await cmsService.removeFaq(String(req.params.faqId));
    res.status(204).send();
  },
};
