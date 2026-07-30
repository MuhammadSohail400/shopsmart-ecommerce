export interface RegisterResponseDto {
  userId: string;
  verificationRequired: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

export interface SessionDto {
  id: string;
  familyId: string;
  createdAt: string;
  expiresAt: string;
}
