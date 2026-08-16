import { prisma } from '@config/database';
import type { CreateContactMessageBody } from './contact.validators';

export const contactRepository = {
  async createMessage(data: CreateContactMessageBody) {
    return prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
      },
    });
  },

  async listMessages(status?: string) {
    return prisma.contactMessage.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  },
};


