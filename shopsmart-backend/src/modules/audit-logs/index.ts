/**
 * Audit Logs Module — public interface.
 * Responsibility: immutable record of sensitive administrative actions
 * (SEC-010). Never updated or deleted once written.
 * Dependencies: none — every other module calls INTO this one.
 */
export { auditLogsRoutes } from './audit-logs.routes';

/**
 * Called by any module performing a sensitive action (price/product edits,
 * refunds, role changes, coupon creation, order status overrides).
 * Fire-and-forget from the caller's perspective is NOT used here — audit
 * writes are awaited synchronously so a failure to log is visible immediately
 * rather than silently lost (unlike notification dispatch, which is
 * fire-and-forget via the event bus).
 */
export async function recordAuditLog(
  actorId: string | undefined,
  action: string,
  entityType: string,
  entityId: string,
  before?: object,
  after?: object,
) {
  const { auditLogsService } = await import('./audit-logs.service');
  return auditLogsService.record(actorId, action, entityType, entityId, before, after);
}
