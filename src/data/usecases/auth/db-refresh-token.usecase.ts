import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshTokenDTO, RefreshTokenResponse, RefreshTokenUseCase } from '@/domain/usecases/auth/refresh-token.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import { AuthSessionRepository } from '@/data/protocols/auth-session.repository';
import { hashToken, parseDurationToDate } from './token-utils';

export class DbRefreshToken implements RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string,
    private readonly refreshTokenSecret: string,
    private readonly refreshTokenExpiresIn: string,
  ) {}

  async execute(data: RefreshTokenDTO): Promise<RefreshTokenResponse> {
    let decoded: { userId: string; type?: string; exp?: number };

    try {
      decoded = jwt.verify(data.refreshToken, this.refreshTokenSecret) as {
        userId: string;
        type?: string;
        exp?: number;
      };
    } catch {
      throw new Error('Refresh token inválido');
    }

    if (decoded.type !== 'refresh') {
      throw new Error('Refresh token inválido');
    }

    const session = await this.authSessionRepository.findByRefreshTokenHash(hashToken(data.refreshToken));
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new Error('Sessão expirada ou revogada');
    }

    if (session.userId !== decoded.userId) {
      throw new Error('Refresh token inválido');
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Rotate: the presented refresh token is single-use. Revoke it and issue a new one,
    // so a leaked token that was already used cannot be replayed.
    await this.authSessionRepository.revokeById(session.id);

    const newRefreshToken = jwt.sign(
      { sessionId: crypto.randomUUID(), userId: user.id, type: 'refresh' },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiresIn } as any
    );

    await this.authSessionRepository.create({
      userId: user.id,
      refreshTokenHash: hashToken(newRefreshToken),
      expiresAt: parseDurationToDate(this.refreshTokenExpiresIn),
    });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as any
    );
    const decodedToken = jwt.decode(accessToken) as { exp?: number } | null;

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresAt: decodedToken?.exp
        ? new Date(decodedToken.exp * 1000).toISOString()
        : undefined,
    };
  }
}
