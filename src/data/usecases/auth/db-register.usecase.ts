import { RegisterUseCase, RegisterDTO } from '@/domain/usecases/auth/register.usecase';
import { UserModel } from '@/domain/models/user.model';
import { UserRepository } from '@/data/protocols/user.repository';
import bcrypt from 'bcryptjs';

export class DbRegister implements RegisterUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: RegisterDTO): Promise<UserModel> {
    // Verificar se usuário já existe
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    return user;
  }
}
