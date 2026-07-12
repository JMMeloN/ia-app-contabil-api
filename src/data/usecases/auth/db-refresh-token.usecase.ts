import jwt from 'jsonwebtoken';
import { RefreshTokenDTO, RefreshTokenResponse, RefreshTokenUseCase } from '@/domain/usecases/auth/refresh-token.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import { AuthSessionRepository } from '@/data/protocols/auth-session.repository';
import { hashToken } from './token-utils';

export class DbRefreshToken implements RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string,
    private readonly refreshTokenSecret: string,
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

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as any
    );
    const decodedToken = jwt.decode(accessToken) as { exp?: number } | null;

    return {
      user,
      accessToken,
      accessTokenExpiresAt: decodedToken?.exp
        ? new Date(decodedToken.exp * 1000).toISOString()
        : undefined,
    };
  }
}
