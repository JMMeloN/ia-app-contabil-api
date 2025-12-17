import { UserModel } from '@/domain/models/user.model';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserModel;
  accessToken: string;
}

export interface LoginUseCase {
  execute(data: LoginDTO): Promise<LoginResponse>;
}
