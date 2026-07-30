import { Response } from 'express';

/**
 * Standard success/paginated response envelopes, matching
 * API Design Specification Section 6 exactly. Every controller shapes
 * its response through these helpers so the envelope never drifts.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { nextCursor: string | null; hasMore: boolean; limit: number },
): Response {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}
