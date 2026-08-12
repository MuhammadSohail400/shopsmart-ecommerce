import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../src/modules/reviews/reviews.repository', () => ({
  reviewsRepository: {
    listForProduct: vi.fn().mockResolvedValue({ items: [], hasMore: false }),
    getAverageRating: vi.fn().mockResolvedValue({ average: 0, count: 0 }),
    findExisting: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    hide: vi.fn(),
  },
}));

vi.mock('../../src/modules/orders/index', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/modules/orders/index')>();
  return { ...actual, hasDeliveredOrderForProduct: vi.fn() };
});

vi.mock('../../src/modules/products/index', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/modules/products/index')>();
  return { ...actual, getProductById: vi.fn().mockResolvedValue({ id: 'product-1', status: 'approved' }) };
});

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

import { reviewsRepository } from '../../src/modules/reviews/reviews.repository';
import { hasDeliveredOrderForProduct } from '../../src/modules/orders/index';
import { createApp } from '../../src/app';
import { env } from '../../src/config/env';

const app = createApp();

function tokenFor(role: string, sub = 'user-1') {
  return jwt.sign({ sub, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

describe('POST /api/v1/products/:productId/reviews (BR-006)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when the customer has no delivered order for this product', async () => {
    (hasDeliveredOrderForProduct as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/products/product-1/reviews')
      .set('Authorization', `Bearer ${tokenFor('customer')}`)
      .send({ rating: 5, comment: 'Great product' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 201 when the customer has a qualifying delivered order', async () => {
    (hasDeliveredOrderForProduct as ReturnType<typeof vi.fn>).mockResolvedValue({ orderId: 'order-1' });
    (reviewsRepository.findExisting as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (reviewsRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'review-1',
      rating: 5,
      comment: 'Great product',
    });

    const res = await request(app)
      .post('/api/v1/products/product-1/reviews')
      .set('Authorization', `Bearer ${tokenFor('customer')}`)
      .send({ rating: 5, comment: 'Great product' });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);
  });

  it('returns 409 REVIEW_ALREADY_EXISTS on a duplicate review for the same order/product', async () => {
    (hasDeliveredOrderForProduct as ReturnType<typeof vi.fn>).mockResolvedValue({ orderId: 'order-1' });
    (reviewsRepository.findExisting as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing-review' });

    const res = await request(app)
      .post('/api/v1/products/product-1/reviews')
      .set('Authorization', `Bearer ${tokenFor('customer')}`)
      .send({ rating: 4 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('REVIEW_ALREADY_EXISTS');
  });

  it('returns 422 for an out-of-range rating', async () => {
    const res = await request(app)
      .post('/api/v1/products/product-1/reviews')
      .set('Authorization', `Bearer ${tokenFor('customer')}`)
      .send({ rating: 7 });

    expect(res.status).toBe(422);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/v1/products/product-1/reviews').send({ rating: 5 });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/products/:productId/reviews (public)', () => {
  it('returns a paginated envelope with a rating summary, no auth required', async () => {
    const res = await request(app).get('/api/v1/products/product-1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('ratingSummary');
    expect(res.body.ratingSummary).toHaveProperty('averageRating');
    expect(res.body.ratingSummary).toHaveProperty('reviewCount');
  });
});
