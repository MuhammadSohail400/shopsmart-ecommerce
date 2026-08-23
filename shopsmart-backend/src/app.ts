import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { correlationIdMiddleware } from '@shared/middleware/correlation-id.middleware';
import { errorHandlerMiddleware, asyncHandler } from '@shared/middleware/error-handler.middleware';
import { paymentsWebhookController } from '@modules/payments';
import { apiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  // --- Security & infra middleware (Backend Standards Section 16) ---
  app.use(helmet());
  const configuredOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          configuredOrigins.includes(origin) ||
          configuredOrigins.includes('*') ||
          /\.netlify\.app$/.test(origin) ||
          /\.vercel\.app$/.test(origin) ||
          (env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(origin))
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true, // required for the HttpOnly refresh-token cookie
    }),
  );

  // Stripe webhook: MUST be mounted before express.json() with a raw-body
  // parser, since signature verification (API Design Spec Section 17.1)
  // needs the exact original payload bytes, not a re-serialized JSON object.
  app.post(
    `${env.API_BASE_PATH}/webhooks/stripe`,
    express.raw({ type: 'application/json' }),
    asyncHandler(paymentsWebhookController.stripeWebhook),
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

  // --- API documentation (Phase 8) ---
  try {
    const openapiDoc = yaml.load(readFileSync(join(__dirname, '../openapi/openapi.yaml'), 'utf8'));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc as object));
  } catch {
    // openapi.yaml missing in this environment — docs endpoint simply
    // won't be available; never let this block the app from starting.
  }

  // --- Static Uploads (ASORA Custom Designs & Previews) ---
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

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
