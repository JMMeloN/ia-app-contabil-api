import { CreateCompanyUseCase, CreateCompanyDTO } from '@/domain/usecases/company/create-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';

export class DbCreateCompany implements CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(data: CreateCompanyDTO): Promise<CompanyModel> {
    // Verificar se o usuário já cadastrou este CNPJ
    const existingCompany = await this.companyRepository.findByUserIdAndCnpj(data.userId, data.cnpj);
    if (existingCompany) {
      throw new Error('Você já cadastrou uma empresa com este CNPJ');
    }

    // Criar empresa
    const company = await this.companyRepository.create(data);

    return company;
  }
}
