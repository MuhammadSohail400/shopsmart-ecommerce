import { paymentsRepository } from './payments.repository';
import { stripeAdapter } from './stripe.adapter';
import { confirmPendingOrder } from '@modules/orders';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { NotFoundError, ConflictError, BusinessRuleError } from '@shared/errors';

interface InitiatePaymentInput {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  idempotencyKey: string;
  couponInfo?: { couponId: string; discountApplied: number; userId?: string };
}

export const paymentsService = {
  /**
   * FR-072/NFR-008: idempotency is enforced by the unique `idempotencyKey`
   * column — a repeated call with the same key returns the original
   * payment rather than creating a duplicate charge/order.
   */
  async initiatePayment(input: InitiatePaymentInput) {
    const existing = await paymentsRepository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;

    if (input.method === PaymentMethod.card) {
      const intent = await stripeAdapter.createPaymentIntent(input.amount, 'usd', input.idempotencyKey, {
        orderId: input.orderId,
      });
      return paymentsRepository.create({
        orderId: input.orderId,
        gatewayPaymentIntentId: intent.id,
        amount: input.amount,
        method: input.method,
        idempotencyKey: input.idempotencyKey,
        status: PaymentStatus.pending,
      });
      // Order remains "pending" until the webhook confirms payment (see
      // handleStripeWebhookEvent below).
    }

    // COD / bank_transfer: no gateway round-trip needed — confirm immediately.
    const payment = await paymentsRepository.create({
      orderId: input.orderId,
      amount: input.amount,
      method: input.method,
      idempotencyKey: input.idempotencyKey,
      status: input.method === PaymentMethod.cod ? PaymentStatus.succeeded : PaymentStatus.pending,
    });

    if (input.method === PaymentMethod.cod) {
      await confirmPendingOrder(input.orderId, input.couponInfo);
    }
    // bank_transfer stays "pending" until an admin manually confirms receipt
    // (flagged for the Admin module in Phase 7 — same pattern as COD once built).

    return payment;
  },

  /**
   * Stripe webhook handler. Verifies the signature (SDD Section 17.1),
   * then advances the order/payment state. Idempotent by construction:
   * confirmPendingOrder() no-ops if the order is no longer "pending"
   * (e.g. a duplicate webhook delivery), matching Stripe's own retry policy.
   */
  async handleStripeWebhookEvent(rawBody: Buffer, signature: string) {
    const event = stripeAdapter.constructWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as { id: string; metadata: Record<string, string> };
        const payment = await paymentsRepository.findByGatewayIntentId(intent.id);
        if (!payment) return; // not one of ours / already handled

        await paymentsRepository.updateStatus(payment.id, PaymentStatus.succeeded);
        await confirmPendingOrder(payment.orderId);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as { id: string };
        const payment = await paymentsRepository.findByGatewayIntentId(intent.id);
        if (payment) await paymentsRepository.updateStatus(payment.id, PaymentStatus.failed);
        break;
      }
      case 'charge.refunded': {
        // Refund status reconciliation for refunds initiated on Stripe's
        // side directly; app-initiated refunds are already tracked via
        // issueRefund() below.
        break;
      }
      default:
        break; // unhandled event types are safely ignored
    }
  },

  async listByOrder(orderId: string) {
    return paymentsRepository.findByOrderId(orderId);
  },

  // BR-004/FR-116: full or partial refund, issued to the original payment method
  async issueRefund(orderId: string, amount: number, reason: string | undefined, idempotencyKey: string) {
    const payments = await paymentsRepository.findByOrderId(orderId);
    const succeededPayment = payments.find((p: { status: PaymentStatus }) => p.status === PaymentStatus.succeeded);
    if (!succeededPayment) {
      throw new NotFoundError('Succeeded payment for this order');
    }

    if (amount > Number(succeededPayment.amount)) {
      throw new BusinessRuleError('REFUND_EXCEEDS_PAYMENT', 'Refund amount cannot exceed the original payment');
    }

    if (succeededPayment.method === PaymentMethod.card) {
      if (!succeededPayment.gatewayPaymentIntentId) {
        throw new ConflictError('MISSING_PAYMENT_INTENT', 'No Stripe payment intent on record for this payment');
      }
      const stripeRefund = await stripeAdapter.createRefund(
        succeededPayment.gatewayPaymentIntentId,
        amount,
        idempotencyKey,
      );
      const refund = await paymentsRepository.createRefund({
        paymentId: succeededPayment.id,
        gatewayRefundId: stripeRefund.id,
        amount,
        reason,
      });
      await paymentsRepository.updateStatus(succeededPayment.id, PaymentStatus.refunded);
      return refund;
    }

    // COD/bank_transfer: manual refund process (BR-004) — recorded as
    // "pending" for an admin/support agent to action outside the system.
    const refund = await paymentsRepository.createRefund({
      paymentId: succeededPayment.id,
      amount,
      reason,
    });
    await paymentsRepository.updateStatus(succeededPayment.id, PaymentStatus.refunded);
    return refund;
  },
};
