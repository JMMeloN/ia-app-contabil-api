import {
  PayerRepository,
  CreatePayerData,
  UpdatePayerData,
  PayerModel,
} from '@/data/protocols/payer.repository';
import { prisma } from './client';

export class PrismaPayerRepository implements PayerRepository {
  async create(data: CreatePayerData): Promise<PayerModel> {
    return prisma.payer.create({ data });
  }

  async findById(id: string): Promise<PayerModel | null> {
    return prisma.payer.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<PayerModel[]> {
    return prisma.payer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserIdAndDocument(userId: string, document: string): Promise<PayerModel | null> {
    return prisma.payer.findUnique({
      where: {
        userId_document: {
          userId,
          document,
        },
      },
    });
  }

  async update(id: string, data: UpdatePayerData): Promise<PayerModel> {
    return prisma.payer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.payer.delete({ where: { id } });
  }
}
