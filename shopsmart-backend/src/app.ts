import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { correlationIdMiddleware } from '@shared/middleware/correlation-id.middleware';
import { errorHandlerMiddleware } from '@shared/middleware/error-handler.middleware';
import { apiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  // --- Security & infra middleware (Backend Standards Section 16) ---
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true, // required for the HttpOnly refresh-token cookie
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(correlationIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => res.locals.requestId as string,
    }),
  );

  // --- Health checks (SDD Section 15) ---
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/ready', async (_req: Request, res: Response) => {
    try {
      const { prisma } = await import('@config/database');
      const { redis } = await import('@config/redis');
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not ready' });
    }
  });

  // --- API routes (versioned per API Design Specification Section 4) ---
  app.use(env.API_BASE_PATH, apiRouter);

  // --- 404 fallback ---
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        type: 'https://shopsmart.ai/errors/not-found',
        title: 'Not Found',
        status: 404,
        code: 'ROUTE_NOT_FOUND',
        detail: `No route matches ${req.method} ${req.originalUrl}`,
        userMessage: 'The requested resource was not found.',
        instance: req.originalUrl,
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // --- Global error handler (must be last) ---
  app.use(errorHandlerMiddleware);

  return app;
}
