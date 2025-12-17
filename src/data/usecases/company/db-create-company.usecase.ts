import { CreateCompanyUseCase, CreateCompanyDTO } from '@/domain/usecases/company/create-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';

export class DbCreateCompany implements CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(data: CreateCompanyDTO): Promise<CompanyModel> {
    // Verificar se CNPJ já existe
    const existingCompany = await this.companyRepository.findByCnpj(data.cnpj);
    if (existingCompany) {
      throw new Error('CNPJ já cadastrado');
    }

    // Criar empresa
    const company = await this.companyRepository.create(data);

    return company;
  }
}
