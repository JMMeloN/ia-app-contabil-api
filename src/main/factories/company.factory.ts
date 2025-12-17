import { DbCreateCompany } from '@/data/usecases/company/db-create-company.usecase';
import { DbListCompanies } from '@/data/usecases/company/db-list-companies.usecase';
import { DbUpdateCompany } from '@/data/usecases/company/db-update-company.usecase';
import { DbDeleteCompany } from '@/data/usecases/company/db-delete-company.usecase';
import { PrismaCompanyRepository } from '@/infra/db/prisma/company.repository';

export function makeCreateCompanyUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  return new DbCreateCompany(companyRepository);
}

export function makeListCompaniesUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  return new DbListCompanies(companyRepository);
}

export function makeUpdateCompanyUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  return new DbUpdateCompany(companyRepository);
}

export function makeDeleteCompanyUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  return new DbDeleteCompany(companyRepository);
}
