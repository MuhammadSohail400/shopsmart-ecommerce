import { EventEmitter } from 'node:events';
import { logger } from '@config/logger';
import type { DomainEventMap, DomainEventName } from './event-types';

/**
 * Field names that must never appear in log output.
 * Extend this list if new event payloads introduce additional secret fields.
 * (F-1 fix: SEC-012 — raw reset token must not be logged, per audit finding)
 */
const SENSITIVE_PAYLOAD_FIELDS = new Set([
  'resetToken',
  'token',
  'secret',
  'otp',
  'password',
  'passwordHash',
]);

/**
 * Returns a shallow-cloned payload with known-sensitive fields replaced by
 * '[REDACTED]'. The original object is never mutated — subscribers still
 * receive the full payload via emit().
 */
function sanitizeForLog(payload: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { ...payload };
  for (const key of Object.keys(safe)) {
    if (SENSITIVE_PAYLOAD_FIELDS.has(key)) {
      safe[key] = '[REDACTED]';
    }
  }
  return safe;
}

/**
 * In-process pub/sub (Backend Standards Section 14.2). Listeners are
 * registered at startup (see notifications module's listener registration)
 * and run asynchronously via the job runner, never blocking the request
 * that raised the event. This is the exact seam SDD Section 20 upgrades to
 * a real message broker later — event names/payloads don't change.
 */
class DomainEventBus extends EventEmitter {
  publish<K extends DomainEventName>(event: K, payload: DomainEventMap[K]): void {
    // F-1 fix: log a sanitized copy; the full payload is passed to subscribers unchanged.
    // Cast through `unknown` first: the event union types lack an index signature so a
    // direct `as Record<string, unknown>` is rejected by TS — `unknown` widens safely.
    logger.debug({ event, payload: sanitizeForLog(payload as unknown as Record<string, unknown>) }, 'Domain event published');
    this.emit(event, payload);
  }

  subscribe<K extends DomainEventName>(event: K, handler: (payload: DomainEventMap[K]) => Promise<void>): void {
    this.on(event, (payload: DomainEventMap[K]) => {
      // Fire-and-forget from the emitter's perspective; each handler is
      // responsible for its own error handling (Section 22: no silent job failures).
      handler(payload).catch((err) => {
        logger.error({ err, event }, 'Domain event handler failed');
      });
    });
  }
}

export const eventBus = new DomainEventBus();
export type { DomainEventName, DomainEventMap } from './event-types';
