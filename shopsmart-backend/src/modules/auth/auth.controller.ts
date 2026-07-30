import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '@shared/utils/response.util';
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookie } from '@shared/utils/cookie.util';
import { AuthenticationError } from '@shared/errors';
import type { RegisterBody, LoginBody } from './auth.validators';

/**
 * Controllers stay thin: parse req -> call exactly one service method ->
 * shape the response (Backend Standards Section 5).
 */
export const authController = {
  async register(req: Request, res: Response) {
    const body = req.body as RegisterBody;
    const result = await authService.register(body);
    sendSuccess(res, result, 201);
  },

  async login(req: Request, res: Response) {
    const body = req.body as LoginBody;
    const { user, tokens } = await authService.login(body);

    setRefreshTokenCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    sendSuccess(res, {
      accessToken: tokens.accessToken,
      user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
    });
  },

  async refresh(req: Request, res: Response) {
    const rawToken = getRefreshTokenFromCookie(req.cookies);
    if (!rawToken) throw new AuthenticationError('REFRESH_TOKEN_MISSING', 'No refresh token provided');

    const { user, tokens } = await authService.refresh(rawToken);
    setRefreshTokenCookie(res, tokens.refreshTokenRaw, tokens.refreshTokenExpiresAt);
    sendSuccess(res, {
      accessToken: tokens.accessToken,
      user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
    });
  },

  async logout(req: Request, res: Response) {
    const rawToken = getRefreshTokenFromCookie(req.cookies);
    if (rawToken) await authService.logout(rawToken);
    clearRefreshTokenCookie(res);
    res.status(204).send();
  },

  async requestPasswordReset(req: Request, res: Response) {
    await authService.requestPasswordReset(req.body.identifier);
    // Always 200, regardless of whether the account exists (no enumeration)
    sendSuccess(res, { message: 'If an account exists, a reset link has been sent.' });
  },

  async confirmPasswordReset(req: Request, res: Response) {
    // In Phase 1-3 the reset token is a signed access token (see service);
    // real implementation swaps this for a dedicated reset-token verify.
    const { verifyAccessToken } = await import('@shared/utils/jwt.util');
    let userId: string;
    try {
      userId = verifyAccessToken(req.body.token).sub;
    } catch {
      throw new AuthenticationError('RESET_TOKEN_INVALID', 'Invalid or expired reset token');
    }
    await authService.confirmPasswordReset(userId, req.body.newPassword);
    sendSuccess(res, { message: 'Password updated successfully.' });
  },

  async listSessions(req: Request, res: Response) {
    const sessions = await authService.listSessions(req.user!.id);
    sendSuccess(
      res,
      sessions.map((s: { id: string; familyId: string; createdAt: Date; expiresAt: Date }) => ({
        id: s.id,
        familyId: s.familyId,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    );
  },

  async revokeSession(req: Request, res: Response) {
    await authService.revokeSession(req.user!.id, String(req.params.sessionId));
    res.status(204).send();
  },
};
