import { LoginUseCase, LoginDTO, LoginResponse } from '@/domain/usecases/auth/login.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import { AuthSessionRepository } from '@/data/protocols/auth-session.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { hashToken, parseDurationToDate } from './token-utils';

export class DbLogin implements LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string,
    private readonly refreshTokenSecret: string,
    private readonly refreshTokenExpiresIn: string,
    private readonly authSessionRepository: AuthSessionRepository
  ) {}

  async execute(data: LoginDTO): Promise<LoginResponse> {
    // Buscar usuário
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    } as any);
    const decodedToken = jwt.decode(accessToken) as { exp?: number } | null;
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = jwt.sign(
      { sessionId: refreshTokenId, userId: user.id, type: 'refresh' },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiresIn } as any
    );

    await this.authSessionRepository.create({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: parseDurationToDate(this.refreshTokenExpiresIn),
    });

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: decodedToken?.exp
        ? new Date(decodedToken.exp * 1000).toISOString()
        : undefined,
    };
  }
}
