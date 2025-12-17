import { UserModel } from '@/domain/models/user.model';

export interface UpdateProfileDTO {
  userId: string;
  name?: string;
  email?: string;
}

export interface UpdateProfileUseCase {
  execute(data: UpdateProfileDTO): Promise<UserModel>;
}
