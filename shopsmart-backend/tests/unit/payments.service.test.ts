import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/modules/payments/payments.repository', () => ({
  paymentsRepository: {
    findByIdempotencyKey: vi.fn(),
    findByGatewayIntentId: vi.fn(),
    findByOrderId: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    createRefund: vi.fn(),
    updateRefundStatus: vi.fn(),
  },
}));

vi.mock('../../src/modules/payments/stripe.adapter', () => ({
  stripeAdapter: {
    createPaymentIntent: vi.fn(),
    createRefund: vi.fn(),
    constructWebhookEvent: vi.fn(),
  },
}));

vi.mock('@modules/orders', () => ({ confirmPendingOrder: vi.fn() }));
vi.mock('@modules/audit-logs', () => ({ recordAuditLog: vi.fn() }));

import { paymentsRepository } from '../../src/modules/payments/payments.repository';
import { confirmPendingOrder } from '../../src/modules/orders/index';
import { paymentsService } from '../../src/modules/payments/payments.service';

describe('paymentsService.initiatePayment (FR-072/NFR-008 idempotency)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the existing payment on a repeated call with the same idempotency key, without creating a new one', async () => {
    const existingPayment = { id: 'payment-1', orderId: 'order-1', status: 'succeeded' };
    (paymentsRepository.findByIdempotencyKey as ReturnType<typeof vi.fn>).mockResolvedValue(existingPayment);

    const result = await paymentsService.initiatePayment({
      orderId: 'order-1',
      amount: 500,
      method: 'cod' as never,
      idempotencyKey: 'same-key-123',
    });

    expect(result).toBe(existingPayment);
    expect(paymentsRepository.create).not.toHaveBeenCalled();
    expect(confirmPendingOrder).not.toHaveBeenCalled();
  });

  it('COD confirms the order immediately (synchronous, no gateway round-trip)', async () => {
    (paymentsRepository.findByIdempotencyKey as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (paymentsRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'payment-2',
      status: 'succeeded',
    });

    await paymentsService.initiatePayment({
      orderId: 'order-2',
      amount: 300,
      method: 'cod' as never,
      idempotencyKey: 'key-456',
    });

    expect(confirmPendingOrder).toHaveBeenCalledWith('order-2', undefined);
  });

  it('bank_transfer does NOT confirm the order immediately (stays pending for manual admin action)', async () => {
    (paymentsRepository.findByIdempotencyKey as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (paymentsRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'payment-3',
      status: 'pending',
    });

    await paymentsService.initiatePayment({
      orderId: 'order-3',
      amount: 300,
      method: 'bank_transfer' as never,
      idempotencyKey: 'key-789',
    });

    expect(confirmPendingOrder).not.toHaveBeenCalled();
  });
});

describe('paymentsService.handleStripeWebhookEvent — idempotent by construction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ignores a webhook for a payment intent that is not on record (already handled / not ours)', async () => {
    const { stripeAdapter } = await import('../../src/modules/payments/stripe.adapter');
    (stripeAdapter.constructWebhookEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_unknown', metadata: {} } },
    });
    (paymentsRepository.findByGatewayIntentId as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await paymentsService.handleStripeWebhookEvent(Buffer.from('{}'), 'sig');

    expect(confirmPendingOrder).not.toHaveBeenCalled();
  });

  it('confirms the order exactly once on payment_intent.succeeded', async () => {
    const { stripeAdapter } = await import('../../src/modules/payments/stripe.adapter');
    (stripeAdapter.constructWebhookEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123', metadata: {} } },
    });
    (paymentsRepository.findByGatewayIntentId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'payment-1',
      orderId: 'order-1',
    });

    await paymentsService.handleStripeWebhookEvent(Buffer.from('{}'), 'sig');

    expect(confirmPendingOrder).toHaveBeenCalledWith('order-1');
    expect(confirmPendingOrder).toHaveBeenCalledTimes(1);
  });
});
