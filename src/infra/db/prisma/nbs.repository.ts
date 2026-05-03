import { NbsRepository, NbsModel, CreateNbsData, UpdateNbsData } from '@/data/protocols/nbs.repository';
import { prisma } from './client';

export class PrismaNbsRepository implements NbsRepository {
  async create(data: CreateNbsData): Promise<NbsModel> {
    return prisma.nbs.create({ data });
  }

  async findAll(): Promise<NbsModel[]> {
    return prisma.nbs.findMany({ orderBy: { nbs: 'asc' } });
  }

  async findById(id: string): Promise<NbsModel | null> {
    return prisma.nbs.findUnique({ where: { id } });
  }

  async findByCode(nbs: string): Promise<NbsModel | null> {
    return prisma.nbs.findUnique({ where: { nbs } });
  }

  async update(id: string, data: UpdateNbsData): Promise<NbsModel> {
    return prisma.nbs.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.nbs.delete({ where: { id } });
  }
}
