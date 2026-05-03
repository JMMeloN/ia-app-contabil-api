import { CnaeRepository, CnaeModel, CreateCnaeData, UpdateCnaeData } from '@/data/protocols/cnae.repository';
import { prisma } from './client';

export class PrismaCnaeRepository implements CnaeRepository {
  async create(data: CreateCnaeData): Promise<CnaeModel> {
    return prisma.cnae.create({ data });
  }

  async createMany(data: CreateCnaeData[]): Promise<number> {
    const result = await prisma.cnae.createMany({ data, skipDuplicates: true });
    return result.count;
  }

  async count(): Promise<number> {
    return prisma.cnae.count();
  }

  async findAll(search?: string): Promise<CnaeModel[]> {
    return prisma.cnae.findMany({
      where: search
        ? {
            OR: [
              { codCnae: { contains: search, mode: 'insensitive' } },
              { descricaoCnae: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { codCnae: 'asc' },
    });
  }

  async findById(id: string): Promise<CnaeModel | null> {
    return prisma.cnae.findUnique({ where: { id } });
  }

  async findByCode(codCnae: string): Promise<CnaeModel | null> {
    return prisma.cnae.findUnique({ where: { codCnae } });
  }

  async update(id: string, data: UpdateCnaeData): Promise<CnaeModel> {
    return prisma.cnae.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.cnae.delete({ where: { id } });
  }
}
