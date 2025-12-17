export type UserRole = 'CLIENTE' | 'OPERACIONAL' | 'ADMIN';

export interface UserModel {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends UserModel {
  password: string;
}
