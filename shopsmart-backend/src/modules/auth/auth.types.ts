import { Role } from '@prisma/client';

export interface RegisterInput {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  identifier: string; // email or phone
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshTokenRaw: string;
  refreshTokenExpiresAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: Role;
  emailVerified: boolean;
  phoneVerified: boolean;
}
