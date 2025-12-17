import { ChangePasswordUseCase, ChangePasswordDTO } from '@/domain/usecases/auth/change-password.usecase';
import { UserRepository } from '@/data/protocols/user.repository';
import bcrypt from 'bcryptjs';

export class DbChangePassword implements ChangePasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: ChangePasswordDTO): Promise<void> {
    // Buscar usuário com senha
    const user = await this.userRepository.findByIdWithPassword(data.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Atualizar senha
    await this.userRepository.updatePassword(data.userId, hashedPassword);
  }
}
