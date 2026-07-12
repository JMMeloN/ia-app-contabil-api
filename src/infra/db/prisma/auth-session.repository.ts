import {
  AuthSessionRepository,
  CreateAuthSessionData,
} from '@/data/protocols/auth-session.repository';
import { AuthSessionModel } from '@/domain/models/auth-session.model';
import { prisma } from './client';

export class PrismaAuthSessionRepository implements AuthSessionRepository {
  async create(data: CreateAuthSessionData): Promise<AuthSessionModel> {
    return prisma.authSession.create({ data });
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSessionModel | null> {
    return prisma.authSession.findUnique({
      where: { refreshTokenHash },
    });
  }

  async revokeById(id: string): Promise<void> {
    await prisma.authSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeByUserId(userId: string): Promise<void> {
    await prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
