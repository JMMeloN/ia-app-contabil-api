import { DbRegister } from '@/data/usecases/auth/db-register.usecase';
import { DbLogin } from '@/data/usecases/auth/db-login.usecase';
import { DbUpdateProfile } from '@/data/usecases/auth/db-update-profile.usecase';
import { DbChangePassword } from '@/data/usecases/auth/db-change-password.usecase';
import { PrismaUserRepository } from '@/infra/db/prisma/user.repository';
import { env } from '@/main/config/env';

export function makeRegisterUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbRegister(userRepository);
}

export function makeLoginUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbLogin(userRepository, env.jwtSecret, env.jwtExpiresIn);
}

export function makeUpdateProfileUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbUpdateProfile(userRepository);
}

export function makeChangePasswordUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbChangePassword(userRepository);
}
