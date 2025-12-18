import { CompanyRepository, CreateCompanyData, UpdateCompanyData } from '@/data/protocols/company.repository';
import { CompanyModel } from '@/domain/models/company.model';
import { prisma } from './client';

export class PrismaCompanyRepository implements CompanyRepository {
  async create(data: CreateCompanyData): Promise<CompanyModel> {
    const company = await prisma.company.create({
      data,
    });

    return company;
  }

  async findByUserId(userId: string): Promise<CompanyModel[]> {
    const companies = await prisma.company.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return companies;
  }

  async findById(id: string): Promise<CompanyModel | null> {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    return company;
  }

  async findByUserIdAndCnpj(userId: string, cnpj: string): Promise<CompanyModel | null> {
    const company = await prisma.company.findUnique({
      where: {
        userId_cnpj: {
          userId,
          cnpj,
        },
      },
    });

    return company;
  }

  async update(id: string, data: UpdateCompanyData): Promise<CompanyModel> {
    const company = await prisma.company.update({
      where: { id },
      data,
    });

    return company;
  }

  async delete(id: string): Promise<void> {
    await prisma.company.delete({
      where: { id },
    });
  }
}
