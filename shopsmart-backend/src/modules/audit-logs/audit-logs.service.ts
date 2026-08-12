import { auditLogsRepository } from './audit-logs.repository';

export const auditLogsService = {
  async record(
    actorId: string | undefined,
    action: string,
    entityType: string,
    entityId: string,
    before?: object,
    after?: object,
  ) {
    return auditLogsRepository.create({ actorId, action, entityType, entityId, before, after });
  },

  async list(filters: { entityType?: string; actorId?: string; cursor?: string; limit: number }) {
    return auditLogsRepository.list(filters);
  },
};
