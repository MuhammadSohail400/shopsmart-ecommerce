import { prisma } from '@config/database';

export const auditLogsRepository = {
  create(data: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: object;
    after?: object;
  }) {
    return prisma.auditLog.create({ data });
  },

  list(filters: { entityType?: string; actorId?: string; cursor?: string; limit: number }) {
    return prisma.auditLog.findMany({
      where: { entityType: filters.entityType, actorId: filters.actorId },
      take: filters.limit,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
  },
};
