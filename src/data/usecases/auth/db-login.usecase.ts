import { LoginUseCase, LoginDTO, LoginResponse } from '@/domain/usecases/auth/login.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class DbLogin implements LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string
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

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}
