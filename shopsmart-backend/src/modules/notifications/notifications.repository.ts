import { prisma } from '@config/database';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

export const notificationsRepository = {
  create(data: {
    userId?: string;
    type: string;
    channel: NotificationChannel;
    recipient: string;
    status: NotificationStatus;
    error?: string;
  }) {
    return prisma.notificationLog.create({
      data: { ...data, sentAt: data.status === NotificationStatus.sent ? new Date() : null },
    });
  },

  list(filters: { type?: string; status?: NotificationStatus; cursor?: string; limit: number }) {
    return prisma.notificationLog.findMany({
      where: { type: filters.type, status: filters.status },
      take: filters.limit,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
  },

  // --- Preferences ---

  findPreference(userId: string) {
    return prisma.notificationPreference.findUnique({ where: { userId } });
  },

  upsertPreference(userId: string, marketingEmailsOptIn: boolean) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: { marketingEmailsOptIn },
      create: { userId, marketingEmailsOptIn },
    });
  },
};
