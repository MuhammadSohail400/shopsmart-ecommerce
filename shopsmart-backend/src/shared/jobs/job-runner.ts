import { logger } from '@config/logger';

/**
 * Lightweight in-process job runner (Backend Standards Section 14.1/14.3).
 * `enqueue` schedules work off the current request's call stack via
 * setImmediate so a slow job (e.g. sending an email) never delays the
 * HTTP response. Upgrading to BullMQ/RabbitMQ later (SDD Section 20) means
 * swapping this file's implementation only — callers never change.
 */
export const jobRunner = {
  enqueue(jobName: string, task: () => Promise<void>): void {
    setImmediate(() => {
      task().catch((err) => {
        // Section 22: no silent job failures — always logged loudly.
        logger.error({ err, jobName }, 'Background job failed');
      });
    });
  },
};
