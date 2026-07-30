import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../src/modules/orders/orders.repository', () => ({
  ordersRepository: {
    findById: vi.fn(),
    findByIdForUser: vi.fn(),
    list: vi.fn(),
    createPending: vi.fn(),
    confirmInTx: vi.fn(),
    updateStatus: vi.fn(),
    markDelivered: vi.fn(),
  },
}));

vi.mock('@config/redis', () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn(),
    ttl: vi.fn().mockResolvedValue(60),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    ping: vi.fn().mockResolvedValue('PONG'),
    on: vi.fn(),
  },
}));

vi.mock('@config/database', () => {
  const fakeTx = {
    inventory: { update: vi.fn(), updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    order: { update: vi.fn() },
    orderStatusHistory: { create: vi.fn() },
    couponRedemption: { create: vi.fn() },
  };
  return {
    prisma: {
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(fakeTx)),
      $queryRaw: vi.fn(),
      $connect: vi.fn(),
      $disconnect: vi.fn(),
    },
  };
});

import { ordersRepository } from '../../src/modules/orders/orders.repository';
import { createApp } from '../../src/app';
import { env } from '../../src/config/env';

const app = createApp();

function tokenFor(role: string, sub = 'user-1') {
  return jwt.sign({ sub, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

describe('POST /api/v1/orders/:orderId/cancellation (BR-005)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 204 and succeeds when order status is "confirmed"', async () => {
    (ordersRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'confirmed',
      items: [{ productVariantId: 'v1', quantity: 2 }],
    });

    const res = await request(app)
      .post('/api/v1/orders/order-1/cancellation')
      .set('Authorization', `Bearer ${tokenFor('customer', 'user-1')}`);

    expect(res.status).toBe(204);
  });

  it('returns 409 CANCELLATION_WINDOW_CLOSED once order is "processing" (past the allowed window)', async () => {
    (ordersRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'processing',
      items: [],
    });

    const res = await request(app)
      .post('/api/v1/orders/order-1/cancellation')
      .set('Authorization', `Bearer ${tokenFor('customer', 'user-1')}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CANCELLATION_WINDOW_CLOSED');
  });

  it("returns 403 when a customer tries to cancel someone else's order", async () => {
    (ordersRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-1',
      userId: 'someone-else',
      status: 'confirmed',
      items: [],
    });

    const res = await request(app)
      .post('/api/v1/orders/order-1/cancellation')
      .set('Authorization', `Bearer ${tokenFor('customer', 'user-1')}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for a nonexistent order', async () => {
    (ordersRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/orders/does-not-exist/cancellation')
      .set('Authorization', `Bearer ${tokenFor('customer')}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/orders/:orderId — ownership scoping', () => {
  beforeEach(() => vi.clearAllMocks());

  it('a customer only sees their own order (findByIdForUser is used, not findById)', async () => {
    (ordersRepository.findByIdForUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'confirmed',
    });

    const res = await request(app)
      .get('/api/v1/orders/order-1')
      .set('Authorization', `Bearer ${tokenFor('customer', 'user-1')}`);

    expect(res.status).toBe(200);
    expect(ordersRepository.findByIdForUser).toHaveBeenCalledWith('order-1', 'user-1');
    expect(ordersRepository.findById).not.toHaveBeenCalled();
  });

  it('staff (support_agent) can look up any order via findById, not scoped to a user', async () => {
    (ordersRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-1',
      userId: 'some-customer',
      status: 'confirmed',
    });

    const res = await request(app)
      .get('/api/v1/orders/order-1')
      .set('Authorization', `Bearer ${tokenFor('support_agent', 'staff-1')}`);

    expect(res.status).toBe(200);
    expect(ordersRepository.findById).toHaveBeenCalledWith('order-1');
  });
});
