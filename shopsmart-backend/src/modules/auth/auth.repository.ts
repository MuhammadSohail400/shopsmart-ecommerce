import { prisma } from '@config/database';
import { Role } from '@prisma/client';

/**
 * Translates auth-module intent into Prisma queries. Services never
 * import PrismaClient directly (Backend Standards Section 5).
 */
export const authRepository = {
  findByEmailOrPhone(identifier: string) {
    const trimmed = identifier.trim();
    return prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email: trimmed.toLowerCase() }, { phone: trimmed }],
      },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email: email.trim().toLowerCase(), deletedAt: null } });
  },

  findByPhone(phone: string) {
    return prisma.user.findFirst({ where: { phone: phone.trim(), deletedAt: null } });
  },

  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  createUser(data: { email?: string; phone?: string; passwordHash: string; role?: Role }) {
    return prisma.user.create({
      data: {
        email: data.email?.toLowerCase(),
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role ?? Role.customer,
      },
    });
  },

  updatePasswordHash(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  markEmailVerified(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });
  },

  markPhoneVerified(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { phoneVerified: true } });
  },

  // --- Refresh token family management (SDD Section 9.2) ---

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeTokenFamily(familyId: string) {
    return prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revoked: true },
    });
  },

  revokeToken(tokenHash: string) {
    return prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });
  },

  revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  },

  listActiveSessions(userId: string) {
    return prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findSessionById(id: string, userId: string) {
    return prisma.refreshToken.findFirst({ where: { id, userId } });
  },
};
