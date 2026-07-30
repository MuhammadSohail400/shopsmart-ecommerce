import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates/propagates X-Correlation-Id (API Design Spec Section 5) and
 * attaches it to res.locals so it's available to the response envelope
 * (response.util.ts) and to every log line for this request
 * (Backend Standards Section 12.3).
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('X-Correlation-Id');
  const requestId = incoming && incoming.length > 0 ? incoming : uuidv4();

  res.locals.requestId = requestId;
  res.setHeader('X-Correlation-Id', requestId);
  next();
}
