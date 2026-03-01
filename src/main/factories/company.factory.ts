import { DbCreateCompany } from '@/data/usecases/company/db-create-company.usecase';
import { DbListCompanies } from '@/data/usecases/company/db-list-companies.usecase';
import { DbUpdateCompany } from '@/data/usecases/company/db-update-company.usecase';
import { DbDeleteCompany } from '@/data/usecases/company/db-delete-company.usecase';
import { DbUploadCertificate } from '@/data/usecases/company/db-upload-certificate.usecase';
import { PrismaCompanyRepository } from '@/infra/db/prisma/company.repository';
import { NFEIOService } from '@/infra/nfeio/nfeio.service';
import { ViaCepService } from '@/infra/cep/viacep-service';

export function makeCreateCompanyUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  const nfeioService = new NFEIOService();
  const cepService = new ViaCepService();
  return new DbCreateCompany(companyRepository, nfeioService, cepService);
}

export function makeListCompaniesUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  const nfeioService = new NFEIOService();
  return new DbListCompanies(companyRepository, nfeioService);
}

export function makeUpdateCompanyUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  const nfeioService = new NFEIOService();
  return new DbUpdateCompany(companyRepository, nfeioService);
}

export function makeDeleteCompanyUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  const nfeioService = new NFEIOService();
  return new DbDeleteCompany(companyRepository, nfeioService);
}

export function makeUploadCertificateUseCase() {
  const companyRepository = new PrismaCompanyRepository();
  const nfeioService = new NFEIOService();
  return new DbUploadCertificate(companyRepository, nfeioService);
}
