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

  async findByCompanyId(companyId: string): Promise<PayerModel[]> {
    return prisma.payer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompanyIdAndDocument(companyId: string, document: string): Promise<PayerModel | null> {
    return prisma.payer.findUnique({
      where: {
        companyId_document: {
          companyId,
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
