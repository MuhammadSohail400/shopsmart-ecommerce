import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the auth repository before importing the app (module boundary
// respected: we mock at the repository layer, per Backend Standards
// Section 17.1, not the service or controller).
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

import { authRepository } from '../../src/modules/auth/auth.repository';
import { createApp } from '../../src/app';

const app = createApp();

describe('POST /api/v1/auth/register (SRS FR-001/FR-002, PRD Business Rules)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 and verificationRequired:true on valid registration (matches API Design Spec Section 9.1)', async () => {
    (authRepository.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (authRepository.createUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-123',
      email: 'sohail@example.com',
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'sohail@example.com', password: 'StrongPass1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ userId: 'user-123', verificationRequired: true });
    // Standard envelope shape (API Design Spec Section 6.1)
    expect(res.body.meta).toHaveProperty('requestId');
    expect(res.body.meta).toHaveProperty('timestamp');
  });

  it('returns 422 VALIDATION_ERROR when neither email nor phone is provided (VR-003/VR-004)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ password: 'StrongPass1' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.validationErrors)).toBe(true);
  });

  it('returns 422 when password is under 8 characters (VR-001)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'x@example.com', password: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.error.validationErrors.some((e: { field: string }) => e.field === 'password')).toBe(
      true,
    );
  });

  it('returns 422 EMAIL_ALREADY_REGISTERED when the email is taken (BR pattern from PRD Section 15.3)', async () => {
    (authRepository.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing-user' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'taken@example.com', password: 'StrongPass1' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });
});

describe('POST /api/v1/auth/login (SRS FR-005, API Design Spec Section 3.2)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a generic 401 for invalid credentials without revealing which field was wrong (SRS Section 9)', async () => {
    (authRepository.findByEmailOrPhone as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'nobody@example.com', password: 'whatever123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.userMessage.toLowerCase()).not.toContain('email');
    expect(res.body.error.userMessage.toLowerCase()).not.toContain('user not found');
  });

  it('sets an HttpOnly refresh token cookie on success (SDD Section 9.3)', async () => {
    const argon2 = await import('argon2');
    const passwordHash = await argon2.hash('StrongPass1');

    (authRepository.findByEmailOrPhone as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-123',
      email: 'sohail@example.com',
      phone: null,
      role: 'customer',
      passwordHash,
    });
    (authRepository.createRefreshToken as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'sohail@example.com', password: 'StrongPass1' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies?.some((c) => c.includes('refreshToken') && c.includes('HttpOnly'))).toBe(true);
  });
});

describe('POST /api/v1/auth/password-reset (P0 & P1-1 Security Fix Verification)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requestPasswordReset preserves anti-user-enumeration for non-existent users', async () => {
    (authRepository.findByEmailOrPhone as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/password-reset/request')
      .send({ identifier: 'nonexistent@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('If an account exists');
    // Raw reset token is NOT returned in API response (P1-1 fix)
    expect(res.body.data.resetToken).toBeUndefined();
  });

  it('rejects password reset when attempted with a normal JWT access token (P0 Fix)', async () => {
    const { signAccessToken } = await import('../../src/shared/utils/jwt.util');
    const validAccessJwt = signAccessToken({ sub: 'user-123', role: 'customer' });

    (authRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-123' });
    const { redis } = await import('../../src/config/redis');
    (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null); // Redis has no key for access JWT hash

    const res = await request(app)
      .post('/api/v1/auth/password-reset/confirm')
      .send({ token: validAccessJwt, newPassword: 'NewStrongPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
  });

  it('successfully resets password with a valid dedicated reset token and revokes sessions', async () => {
    const { generatePasswordResetToken } = await import('../../src/shared/utils/jwt.util');
    const { raw, hash } = generatePasswordResetToken();
    const { redis } = await import('../../src/config/redis');

    (redis.get as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      if (key === `password-reset:${hash}`) return Promise.resolve('user-123');
      return Promise.resolve(null);
    });
    (authRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-123' });
    (authRepository.updatePasswordHash as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (authRepository.revokeAllUserTokens as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/auth/password-reset/confirm')
      .send({ token: raw, newPassword: 'NewStrongPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Password updated successfully.');
    expect(authRepository.updatePasswordHash).toHaveBeenCalledWith('user-123', expect.any(String));
    expect(authRepository.revokeAllUserTokens).toHaveBeenCalledWith('user-123');
    expect(redis.del).toHaveBeenCalledWith(`password-reset:${hash}`);
  });

  it('rejects reset token on second use (single-use enforcement)', async () => {
    const { generatePasswordResetToken } = await import('../../src/shared/utils/jwt.util');
    const { raw } = generatePasswordResetToken();
    const { redis } = await import('../../src/config/redis');

    // Key has been deleted after first use, so redis.get returns null
    (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/password-reset/confirm')
      .send({ token: raw, newPassword: 'AnotherPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
  });
});

