import { auditLogsRepository } from './audit-logs.repository';

function sanitizeAuditData(data: any): any {
  if (!data) return data;
  let normalized = data;
  try {
    normalized = JSON.parse(JSON.stringify(data));
  } catch {
    // fallback
  }

  if (typeof normalized !== 'object' || normalized === null) return normalized;
  if (Array.isArray(normalized)) return normalized.map(sanitizeAuditData);

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(normalized)) {
    if (/password|token|secret|key|credit|cvv|hash/i.test(k)) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeAuditData(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export const auditLogsService = {
  async record(
    actorId: string | undefined,
    action: string,
    entityType: string,
    entityId: string,
    before?: object,
    after?: object,
  ) {
    return auditLogsRepository.create({
      actorId,
      action,
      entityType,
      entityId,
      before: before ? sanitizeAuditData(before) : undefined,
      after: after ? sanitizeAuditData(after) : undefined,
    });
  },

  async list(filters: { entityType?: string; actorId?: string; cursor?: string; limit: number }) {
    return auditLogsRepository.list(filters);
  },
};
