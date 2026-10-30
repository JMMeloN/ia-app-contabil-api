import { CreateCompanyUseCase, CreateCompanyDTO } from '@/domain/usecases/company/create-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NfeioCompanySync } from './nfeio-company-sync';

export class DbCreateCompany implements CreateCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioSync: NfeioCompanySync,
  ) {}

  async execute(data: CreateCompanyDTO): Promise<CompanyModel> {
    const existingCompany = await this.companyRepository.findByUserIdAndCnpj(data.userId, data.cnpj);
    if (existingCompany) {
      throw new Error('Você já cadastrou uma empresa com este CNPJ');
    }

    const { dataAbertura, ...rest } = data;
    const company = await this.companyRepository.create({
      ...rest,
      dataAbertura: dataAbertura ? new Date(dataAbertura) : undefined,
      syncStatus: 'PENDING',
    });

    // Link to NFe.io in the background so the request returns immediately.
    // Any flow that needs the link later calls ensureLinked again on demand.
    this.nfeioSync.ensureLinked(company).catch(() => undefined);

    return company;
  }
}
