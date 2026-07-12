import jwt from 'jsonwebtoken';
import { AuthSessionRepository } from '@/data/protocols/auth-session.repository';
import { LogoutDTO, LogoutUseCase } from '@/domain/usecases/auth/logout.usecase';
import { hashToken } from './token-utils';

export class DbLogout implements LogoutUseCase {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly refreshTokenSecret: string,
  ) {}

  async execute(data: LogoutDTO): Promise<void> {
    try {
      jwt.verify(data.refreshToken, this.refreshTokenSecret);
    } catch {
      throw new Error('Refresh token inválido');
    }

    const session = await this.authSessionRepository.findByRefreshTokenHash(hashToken(data.refreshToken));
    if (!session) {
      return;
    }

    await this.authSessionRepository.revokeById(session.id);
  }
}
