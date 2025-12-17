import { UserRepository, CreateUserData, UpdateUserData } from '@/data/protocols/user.repository';
import { UserModel, UserWithPassword } from '@/domain/models/user.model';
import { prisma } from './client';

export class PrismaUserRepository implements UserRepository {
  async create(data: CreateUserData): Promise<UserModel> {
    const user = await prisma.user.create({
      data,
    });

    return user;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findById(id: string): Promise<UserModel | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findByIdWithPassword(id: string): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<UserModel> {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password },
    });
  }
}
