import { UserModel } from '@/domain/models/user.model';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface RegisterUseCase {
  execute(data: RegisterDTO): Promise<UserModel>;
}
