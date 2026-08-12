import { createApp } from './app';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { redis } from '@config/redis';
import { registerNotificationListeners } from '@modules/notifications';
import { startScheduledJobs } from '@shared/jobs/scheduler';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  logger.info('Database connected');

  // Domain event listeners must be registered before the app starts
  // accepting traffic (Backend Standards Section 14.2).
  registerNotificationListeners();
  startScheduledJobs();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`ShopSmart AI backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown (SDD Section 19 — zero-downtime deploys rely on this)
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      redis.disconnect();
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force-exit if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
