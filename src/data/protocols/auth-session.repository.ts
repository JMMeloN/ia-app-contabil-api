import { AuthSessionModel } from '@/domain/models/auth-session.model';

export interface CreateAuthSessionData {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export interface AuthSessionRepository {
  create(data: CreateAuthSessionData): Promise<AuthSessionModel>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSessionModel | null>;
  revokeById(id: string): Promise<void>;
  revokeByUserId(userId: string): Promise<void>;
}
