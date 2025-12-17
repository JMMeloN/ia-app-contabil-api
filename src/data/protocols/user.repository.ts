import { UserModel, UserWithPassword } from '@/domain/models/user.model';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface UserRepository {
  create(data: CreateUserData): Promise<UserModel>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<UserModel | null>;
  findByIdWithPassword(id: string): Promise<UserWithPassword | null>;
  update(id: string, data: UpdateUserData): Promise<UserModel>;
  updatePassword(id: string, password: string): Promise<void>;
}
