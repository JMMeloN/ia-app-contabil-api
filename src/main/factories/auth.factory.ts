import { DbRegister } from '@/data/usecases/auth/db-register.usecase';
import { DbLogin } from '@/data/usecases/auth/db-login.usecase';
import { DbUpdateProfile } from '@/data/usecases/auth/db-update-profile.usecase';
import { DbChangePassword } from '@/data/usecases/auth/db-change-password.usecase';
import { DbRefreshToken } from '@/data/usecases/auth/db-refresh-token.usecase';
import { DbLogout } from '@/data/usecases/auth/db-logout.usecase';
import { PrismaUserRepository } from '@/infra/db/prisma/user.repository';
import { PrismaAuthSessionRepository } from '@/infra/db/prisma/auth-session.repository';
import { env } from '@/main/config/env';

export function makeRegisterUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbRegister(userRepository);
}

export function makeLoginUseCase() {
  const userRepository = new PrismaUserRepository();
  const authSessionRepository = new PrismaAuthSessionRepository();
  return new DbLogin(
    userRepository,
    env.jwtSecret,
    env.jwtExpiresIn,
    env.refreshTokenSecret,
    env.refreshTokenExpiresIn,
    authSessionRepository
  );
}

export function makeGetCurrentUserRepository() {
  return new PrismaUserRepository();
}

export function makeRefreshTokenUseCase() {
  const userRepository = new PrismaUserRepository();
  const authSessionRepository = new PrismaAuthSessionRepository();
  return new DbRefreshToken(
    userRepository,
    authSessionRepository,
    env.jwtSecret,
    env.jwtExpiresIn,
    env.refreshTokenSecret
  );
}

export function makeLogoutUseCase() {
  const authSessionRepository = new PrismaAuthSessionRepository();
  return new DbLogout(authSessionRepository, env.refreshTokenSecret);
}

export function makeUpdateProfileUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbUpdateProfile(userRepository);
}

export function makeChangePasswordUseCase() {
  const userRepository = new PrismaUserRepository();
  return new DbChangePassword(userRepository);
}
