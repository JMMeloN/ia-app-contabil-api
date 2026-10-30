import { DbCreateCompany } from '@/data/usecases/company/db-create-company.usecase';
import { DbListCompanies } from '@/data/usecases/company/db-list-companies.usecase';
import { DbUpdateCompany } from '@/data/usecases/company/db-update-company.usecase';
import { DbDeleteCompany } from '@/data/usecases/company/db-delete-company.usecase';
import { DbUploadCertificate } from '@/data/usecases/company/db-upload-certificate.usecase';
import { DbSyncCompany } from '@/data/usecases/company/db-sync-company.usecase';
import { NfeioCompanySync } from '@/data/usecases/company/nfeio-company-sync';
import { PrismaCompanyRepository } from '@/infra/db/prisma/company.repository';
import { NFEIOService } from '@/infra/nfeio/nfeio.service';
import { ViaCepService } from '@/infra/cep/viacep-service';

export function makeNfeioCompanySync() {
  return new NfeioCompanySync(new PrismaCompanyRepository(), new NFEIOService(), new ViaCepService());
}

export function makeCreateCompanyUseCase() {
  return new DbCreateCompany(new PrismaCompanyRepository(), makeNfeioCompanySync());
}

export function makeListCompaniesUseCase() {
  return new DbListCompanies(new PrismaCompanyRepository(), new NFEIOService());
}

export function makeUpdateCompanyUseCase() {
  return new DbUpdateCompany(new PrismaCompanyRepository(), makeNfeioCompanySync());
}

export function makeDeleteCompanyUseCase() {
  return new DbDeleteCompany(new PrismaCompanyRepository(), new NFEIOService());
}

export function makeUploadCertificateUseCase() {
  return new DbUploadCertificate(new PrismaCompanyRepository(), new NFEIOService(), makeNfeioCompanySync());
}

export function makeSyncCompanyUseCase() {
  return new DbSyncCompany(new PrismaCompanyRepository(), makeNfeioCompanySync());
}
