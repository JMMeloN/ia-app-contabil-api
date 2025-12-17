import { UpdateCompanyUseCase, UpdateCompanyDTO } from '@/domain/usecases/company/update-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';

export class DbUpdateCompany implements UpdateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(data: UpdateCompanyDTO): Promise<CompanyModel> {
    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(data.id);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    // Verificar se pertence ao usuário
    if (company.userId !== data.userId) {
      throw new Error('Você não tem permissão para editar esta empresa');
    }

    // Se estiver alterando o CNPJ, verificar se já existe
    if (data.cnpj && data.cnpj !== company.cnpj) {
      const existingCompany = await this.companyRepository.findByCnpj(data.cnpj);
      if (existingCompany) {
        throw new Error('CNPJ já cadastrado');
      }
    }

    // Remover userId do data
    const { userId, id, ...updateData } = data;

    // Atualizar empresa
    const updatedCompany = await this.companyRepository.update(data.id, updateData);

    return updatedCompany;
  }
}
