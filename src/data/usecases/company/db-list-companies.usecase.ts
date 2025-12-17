import { ListCompaniesUseCase } from '@/domain/usecases/company/list-companies.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';

export class DbListCompanies implements ListCompaniesUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string): Promise<CompanyModel[]> {
    const companies = await this.companyRepository.findByUserId(userId);
    return companies;
  }
}
