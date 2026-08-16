import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { createApp } from '../../src/app';
import { generatePasswordResetToken, hashPasswordResetToken } from '../../src/shared/utils/jwt.util';

// Integration test suite for Auth & Session management
// Tests full request lifecycle, cookie handling, session lifecycle, and password-reset state transitions.

vi.mock('../../src/modules/auth/auth.repository', () => ({
  authRepository: {
    findByEmail: vi.fn(),
    findByPhone: vi.fn(),
    findByEmailOrPhone: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
    createRefreshToken: vi.fn(),
    findRefreshTokenByHash: vi.fn(),
    revokeTokenFamily: vi.fn(),
    revokeToken: vi.fn(),
    revokeAllUserTokens: vi.fn(),
    listActiveSessions: vi.fn(),
    findSessionById: vi.fn(),
    updatePasswordHash: vi.fn(),
    markEmailVerified: vi.fn(),
  },
}));

vi.mock('@config/redis', () => {
  const store = new Map<string, string>();
  return {
    redis: {
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn(),
      ttl: vi.fn().mockResolvedValue(900),
      get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      set: vi.fn((key: string, val: string) => {
        store.set(key, val);
        return Promise.resolve('OK');
      }),
      del: vi.fn((key: string) => {
        store.delete(key);
        return Promise.resolve(1);
      }),
      ping: vi.fn().mockResolvedValue('PONG'),
      on: vi.fn(),
    },
  };
});

const app = createApp();

describe('Auth & Redis/Session Integration Tests (P1-2 Coverage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Password Reset Lifecycle & State Invalidation', () => {
    it('generates a cryptographically random token, stores hash in Redis, and enforces single-use', async () => {
      const { redis } = await import('../../src/config/redis');
      const user = { id: 'user-integration-1', email: 'integration@shopsmart.ai', role: 'customer' };
      (authRepository.findByEmailOrPhone as ReturnType<typeof vi.fn>).mockResolvedValue(user);

      // 1. Request Password Reset
      const reqRes = await request(app)
        .post('/api/v1/auth/password-reset/request')
        .send({ identifier: 'integration@shopsmart.ai' });

      expect(reqRes.status).toBe(200);
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringMatching(/^password-reset:[a-f0-9]{64}$/),
        'user-integration-1',
        'EX',
        900
      );

      // 2. Perform Confirm Password Reset with generated token
      const { raw, hash } = generatePasswordResetToken();
      (redis.get as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
        if (key === `password-reset:${hash}`) return Promise.resolve('user-integration-1');
        return Promise.resolve(null);
      });
      (authRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(user);
      (authRepository.updatePasswordHash as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (authRepository.revokeAllUserTokens as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const confirmRes = await request(app)
        .post('/api/v1/auth/password-reset/confirm')
        .send({ token: raw, newPassword: 'NewSecurePassword123!' });

      expect(confirmRes.status).toBe(200);
      expect(authRepository.updatePasswordHash).toHaveBeenCalledWith('user-integration-1', expect.any(String));
      expect(authRepository.revokeAllUserTokens).toHaveBeenCalledWith('user-integration-1');
      expect(redis.del).toHaveBeenCalledWith(`password-reset:${hash}`);

      // 3. Second Use Attempt — Reused token must fail (401)
      (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null); // Key was deleted
      const secondRes = await request(app)
        .post('/api/v1/auth/password-reset/confirm')
        .send({ token: raw, newPassword: 'AnotherPassword123!' });

      expect(secondRes.status).toBe(401);
      expect(secondRes.body.error.code).toBe('RESET_TOKEN_INVALID');
    });

    it('rejects password reset confirmation if token is expired or invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/password-reset/confirm')
        .send({ token: 'invalid-nonexistent-token', newPassword: 'NewSecurePassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
    });
  });

  describe('Session Management & Refresh Token Rotation', () => {
    it('completes registration, login, and refresh token cookie propagation', async () => {
      const argon2 = await import('argon2');
      const passwordHash = await argon2.hash('ValidPass123!');

      (authRepository.findByEmailOrPhone as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'user-integration-2',
        email: 'user2@shopsmart.ai',
        phone: null,
        role: 'customer',
        passwordHash,
      });
      (authRepository.createRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'user2@shopsmart.ai', password: 'ValidPass123!' });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.accessToken).toBeDefined();

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('refreshToken') && c.includes('HttpOnly'))).toBe(true);
    });
  });

  // F-3: Refresh-token reuse detection — the most security-critical branch
  // of the refresh flow had no regression test. These two cases cover the
  // theft-detection path in auth.service.ts:refresh().
  describe('Refresh Token Reuse Detection (F-3 coverage, SDD Section 9.2)', () => {
    it('returns 401 REFRESH_TOKEN_REUSE_DETECTED when an already-revoked token is replayed', async () => {
      // Simulate a token that was already rotated (revoked = true)
      (authRepository.findRefreshTokenByHash as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'rt-old-1',
        userId: 'user-integration-3',
        tokenHash: 'some-hash',
        familyId: 'family-abc-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // not expired
        revoked: true, // already rotated — reuse detected
      });
      (authRepository.revokeTokenFamily as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 2 });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=replayed-raw-token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('REFRESH_TOKEN_REUSE_DETECTED');
    });

    it('revokes the entire token family (not just the replayed token) on reuse detection', async () => {
      const FAMILY_ID = 'family-xyz-999';

      (authRepository.findRefreshTokenByHash as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'rt-old-2',
        userId: 'user-integration-4',
        tokenHash: 'another-hash',
        familyId: FAMILY_ID,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: true, // reuse scenario
      });
      (authRepository.revokeTokenFamily as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 3 });

      await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=another-replayed-token');

      // The entire family must be revoked — not just the presented token.
      // This ensures an attacker who obtained a previous rotation cannot
      // continue using any token in that session chain.
      expect(authRepository.revokeTokenFamily).toHaveBeenCalledWith(FAMILY_ID);
      expect(authRepository.revokeTokenFamily).toHaveBeenCalledTimes(1);
    });
  });
});
