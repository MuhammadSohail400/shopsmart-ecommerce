import { prisma } from '@config/database';

export const newsletterRepository = {
  async upsertSubscriber(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    return prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: {},
    });
  },

  async findByEmail(email: string) {
    return prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },
};


