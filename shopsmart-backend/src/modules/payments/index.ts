/**
 * Payments Module — public interface.
 * Responsibility: payment intent creation, webhook-driven confirmation,
 * refund issuance. Sole module allowed to call the Stripe adapter.
 * Dependencies: orders (confirms/finalizes orders once payment succeeds).
 */
import { PaymentMethod } from '@prisma/client';

export { paymentsRoutes, paymentsWebhookController } from './payments.routes';

export async function initiatePayment(input: {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  idempotencyKey: string;
  couponInfo?: { couponId: string; discountApplied: number; userId?: string };
}) {
  const { paymentsService } = await import('./payments.service');
  return paymentsService.initiatePayment(input);
}
