import { v4 as uuidv4 } from 'uuid';
import { authRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '@shared/utils/password.util';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '@shared/utils/jwt.util';
import { AuthenticationError, BusinessRuleError, NotFoundError } from '@shared/errors';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { Role } from '@prisma/client';
import type { RegisterInput, LoginInput, AuthTokens } from './auth.types';

function refreshTokenExpiryDate(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS);
  return expires;
}

async function issueTokenPair(userId: string, role: Role, familyId?: string): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: userId, role });
  const { raw, hash } = generateRefreshToken();
  const expiresAt = refreshTokenExpiryDate();

  await authRepository.createRefreshToken({
    userId,
    tokenHash: hash,
    familyId: familyId ?? uuidv4(),
    expiresAt,
  });

  return { accessToken, refreshTokenRaw: raw, refreshTokenExpiresAt: expiresAt };
}

export const authService = {
  // FR-001/FR-002: registration via email or phone
  async register(input: RegisterInput) {
    if (input.email) {
      const existing = await authRepository.findByEmail(input.email);
      if (existing) throw new BusinessRuleError('EMAIL_ALREADY_REGISTERED', 'This email is already registered');
    }
    if (input.phone) {
      const existing = await authRepository.findByPhone(input.phone);
      if (existing) throw new BusinessRuleError('PHONE_ALREADY_REGISTERED', 'This phone number is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      phone: input.phone,
      passwordHash,
    });

    // FR-003/FR-004: verification email/OTP dispatch is owned by the
    // Notifications module (Phase 6). Logged here as a placeholder so the
    // registration flow is complete and testable before that module exists.
    logger.info({ userId: user.id }, 'TODO(Phase 6): dispatch verification email/OTP');

    return { userId: user.id, verificationRequired: true };
  },

  // FR-005
  async login(input: LoginInput) {
    const user = await authRepository.findByEmailOrPhone(input.identifier);

    // Generic message regardless of which check failed (SRS Section 9 /
    // API Design Spec Section 9.1 — never reveal which field was wrong)
    if (!user) throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid credentials');

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid credentials');

    const tokens = await issueTokenPair(user.id, user.role);
    return { user, tokens };
  },

  // SDD Section 9.2: rotation + reuse detection
  async refresh(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);
    const existing = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!existing || existing.expiresAt < new Date()) {
      throw new AuthenticationError('REFRESH_TOKEN_INVALID', 'Session expired, please log in again');
    }

    if (existing.revoked) {
      // Reuse of an already-rotated token — signal of possible theft.
      // Revoke the entire family per SDD Section 9.2.
      await authRepository.revokeTokenFamily(existing.familyId);
      throw new AuthenticationError(
        'REFRESH_TOKEN_REUSE_DETECTED',
        'Security check failed, please log in again',
      );
    }

    const user = await authRepository.findById(existing.userId);
    if (!user) throw new AuthenticationError();

    await authRepository.revokeToken(tokenHash);
    const tokens = await issueTokenPair(user.id, user.role, existing.familyId);

    return { user, tokens };
  },

  async logout(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);
    const existing = await authRepository.findRefreshTokenByHash(tokenHash);
    if (existing) {
      await authRepository.revokeTokenFamily(existing.familyId);
    }
  },

  async listSessions(userId: string) {
    return authRepository.listActiveSessions(userId);
  },

  async revokeSession(userId: string, sessionId: string) {
    const session = await authRepository.findSessionById(sessionId, userId);
    if (!session) throw new NotFoundError('Session');
    await authRepository.revokeToken(session.tokenHash);
  },

  // FR-006: password reset — token generation here; actual email dispatch
  // deferred to the Notifications module (Phase 6)
  async requestPasswordReset(identifier: string) {
    const user = await authRepository.findByEmailOrPhone(identifier);
    // Always respond as if successful, regardless of whether the account
    // exists, to avoid leaking account existence.
    if (!user) return;

    const resetToken = signAccessToken({ sub: user.id, role: user.role });
    logger.info({ userId: user.id }, 'TODO(Phase 6): dispatch password reset email/OTP');
    return resetToken; // returned only for local/dev testing convenience
  },

  async confirmPasswordReset(userId: string, newPassword: string) {
    const passwordHash = await hashPassword(newPassword);
    await authRepository.updatePasswordHash(userId, passwordHash);
    // SEC-011: invalidate all outstanding sessions on password change
    await authRepository.revokeAllUserTokens(userId);
  },
};
