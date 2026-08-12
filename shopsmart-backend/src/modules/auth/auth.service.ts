import { v4 as uuidv4 } from 'uuid';
import { authRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '@shared/utils/password.util';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generatePasswordResetToken,
  hashPasswordResetToken,
} from '@shared/utils/jwt.util';
import { AuthenticationError, BusinessRuleError, NotFoundError } from '@shared/errors';
import { env } from '@config/env';
import { redis } from '@config/redis';
import { eventBus } from '@shared/events';
import { Role } from '@prisma/client';
import type { RegisterInput, LoginInput, AuthTokens } from './auth.types';

const PHONE_OTP_TTL_SECONDS = 5 * 60; // FR-004: OTP expires after 5 minutes

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

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
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

    // FR-003: email verification dispatch is owned by the Notifications
    // module — Auth only raises the event (Backend Standards Section 14.2).
    if (user.email) {
      eventBus.publish('user.registered', { userId: user.id, email: user.email });
    }

    // FR-004: phone OTP — generated here (Auth owns verification logic),
    // but dispatched through Notifications' sendOtp so Auth never imports
    // an SMS/email provider directly.
    if (user.phone) {
      const code = generateOtpCode();
      await redis.set(`otp:phone:${user.id}`, code, 'EX', PHONE_OTP_TTL_SECONDS);
      const { sendOtp } = await import('@modules/notifications');
      await sendOtp(user.id, user.phone, code);
    }

    return { userId: user.id, verificationRequired: true };
  },

  // FR-003: email verification via signed, time-limited token from the email link
  async verifyEmail(token: string) {
    let userId: string;
    try {
      userId = verifyAccessToken(token).sub;
    } catch {
      throw new AuthenticationError('VERIFICATION_TOKEN_INVALID', 'Invalid or expired verification link');
    }
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    await authRepository.markEmailVerified(userId);
  },

  // FR-004: phone verification via OTP
  async verifyPhoneOtp(userId: string, code: string) {
    const stored = await redis.get(`otp:phone:${userId}`);
    if (!stored || stored !== code) {
      throw new AuthenticationError('OTP_INVALID', 'Invalid or expired verification code');
    }
    await redis.del(`otp:phone:${userId}`);
    await authRepository.markPhoneVerified(userId);
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

  // FR-006: password reset
  async requestPasswordReset(identifier: string): Promise<void> {
    const user = await authRepository.findByEmailOrPhone(identifier);
    // Always respond as if successful, regardless of whether the account
    // exists, to avoid leaking account existence.
    if (!user) return;

    const { raw, hash } = generatePasswordResetToken();
    const PASSWORD_RESET_TTL_SECONDS = 15 * 60; // 15 minutes TTL
    await redis.set(`password-reset:${hash}`, user.id, 'EX', PASSWORD_RESET_TTL_SECONDS);

    if (user.email) {
      eventBus.publish('user.password_reset_requested', { userId: user.id, email: user.email, resetToken: raw });
    }
  },

  async confirmPasswordReset(rawResetToken: string, newPassword: string): Promise<void> {
    const tokenHash = hashPasswordResetToken(rawResetToken);
    const userId = await redis.get(`password-reset:${tokenHash}`);

    if (!userId) {
      throw new AuthenticationError('RESET_TOKEN_INVALID', 'Invalid or expired reset token');
    }

    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('RESET_TOKEN_INVALID', 'Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(newPassword);
    await authRepository.updatePasswordHash(userId, passwordHash);
    // SEC-011: invalidate all outstanding sessions on password change
    await authRepository.revokeAllUserTokens(userId);
    // Single-use credential: invalidate immediately after successful reset
    await redis.del(`password-reset:${tokenHash}`);
  },
};
