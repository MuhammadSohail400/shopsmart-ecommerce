import { prisma } from '@config/database';
import { logger } from '@config/logger';
import { jobRunner } from './job-runner';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const AUTO_CONFIRM_DELIVERY_DAYS = 7; // matches the 7-day window established in Phase 0 planning

/**
 * Simple interval-based scheduler (Backend Standards Section 14.5) — no
 * external cron dependency needed at this scale. Each task runs via
 * jobRunner so a slow run never blocks the next tick's timer.
 */
export function startScheduledJobs(): void {
  setInterval(() => jobRunner.enqueue('expired-checkout-cleanup', expiredCheckoutSessionCleanup), FIFTEEN_MINUTES);
  setInterval(() => jobRunner.enqueue('auto-confirm-delivery', autoConfirmDelivery), ONE_DAY);
  setInterval(() => jobRunner.enqueue('low-stock-digest', lowStockDigest), ONE_DAY);

  logger.info('Scheduled jobs started (checkout cleanup, auto-confirm delivery, low-stock digest)');
}

/** Releases expired, never-completed CheckoutSessions (DDD Section 14.3 reservation window). */
async function expiredCheckoutSessionCleanup(): Promise<void> {
  const result = await prisma.checkoutSession.deleteMany({
    where: { status: 'pending', expiresAt: { lt: new Date() } },
  });
  if (result.count > 0) logger.info({ count: result.count }, 'Expired checkout sessions cleaned up');
}

/** Auto-confirms delivery for shipped orders past the confirmation window (buyer took no action). */
async function autoConfirmDelivery(): Promise<void> {
  const cutoff = new Date(Date.now() - AUTO_CONFIRM_DELIVERY_DAYS * ONE_DAY);
  const staleShipped = await prisma.order.findMany({
    where: { status: 'shipped', shippedAt: { lt: cutoff } },
    select: { id: true },
  });

  for (const order of staleShipped) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'delivered', deliveredAt: new Date(), deliveryConfirmedBy: 'auto' },
      }),
      prisma.orderStatusHistory.create({ data: { orderId: order.id, status: 'delivered' } }),
    ]);
  }
  if (staleShipped.length > 0) logger.info({ count: staleShipped.length }, 'Orders auto-confirmed as delivered');
}

/** FR-105: aggregated low-stock alert — one digest email/log rather than per-item spam. */
async function lowStockDigest(): Promise<void> {
  const lowStockItems: Array<{ product_variant_id: string; quantity: number }> = await prisma.$queryRaw`
    SELECT product_variant_id, quantity FROM inventory WHERE quantity <= low_stock_threshold
  `;
  if (lowStockItems.length === 0) return;

  logger.warn({ count: lowStockItems.length }, 'Low-stock digest: items below threshold');
  // TODO(Phase 7 — Admin module): route this to an actual admin notification
  // channel once Admin alert preferences exist; logged for now.
}
