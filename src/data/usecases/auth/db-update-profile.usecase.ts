import { UpdateProfileUseCase, UpdateProfileDTO } from '@/domain/usecases/auth/update-profile.usecase';
import { UserModel } from '@/domain/models/user.model';
import { UserRepository } from '@/data/protocols/user.repository';

export class DbUpdateProfile implements UpdateProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: UpdateProfileDTO): Promise<UserModel> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Se estiver alterando o email, verificar se já existe
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }
    }

    // Remover userId do data
    const { userId, ...updateData } = data;

    // Atualizar usuário
    const updatedUser = await this.userRepository.update(userId, updateData);

    return updatedUser;
  }
}
