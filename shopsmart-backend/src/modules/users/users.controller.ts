import { Request, Response } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '@shared/utils/response.util';

export const usersController = {
  async getMe(req: Request, res: Response) {
    const user = await usersService.getProfile(req.user!.id);
    sendSuccess(res, {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });
  },

  async updateMe(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, { id: user.id, email: user.email, phone: user.phone });
  },

  async deleteMe(req: Request, res: Response) {
    await usersService.deleteAccount(req.user!.id);
    res.status(204).send();
  },

  async listAddresses(req: Request, res: Response) {
    const addresses = await usersService.listAddresses(req.user!.id);
    sendSuccess(res, addresses);
  },

  async addAddress(req: Request, res: Response) {
    const address = await usersService.addAddress(req.user!.id, req.body);
    sendSuccess(res, address, 201);
  },

  async updateAddress(req: Request, res: Response) {
    const address = await usersService.updateAddress(req.user!.id, req.params.addressId, req.body);
    sendSuccess(res, address);
  },

  async removeAddress(req: Request, res: Response) {
    await usersService.removeAddress(req.user!.id, req.params.addressId);
    res.status(204).send();
  },
};
