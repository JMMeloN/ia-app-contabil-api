import { CompanyModel } from '@/domain/models/company.model';
import { SyncCompanyUseCase, SyncCompanyDTO } from '@/domain/usecases/company/sync-company.usecase';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NfeioCompanySync } from './nfeio-company-sync';

/** Manual retry of the NFe.io link, exposed as POST /companies/:id/sync. */
export class DbSyncCompany implements SyncCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioSync: NfeioCompanySync,
  ) {}

  async execute(data: SyncCompanyDTO): Promise<CompanyModel> {
    const company = await this.companyRepository.findById(data.id);
    if (!company || company.userId !== data.userId) {
      throw new Error('Empresa não encontrada');
    }

    if (company.nfeioCompanyId) {
      await this.nfeioSync.pushUpdate(company);
      return company;
    }

    return this.nfeioSync.ensureLinked(company);
  }
}
