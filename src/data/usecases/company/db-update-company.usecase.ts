import { UpdateCompanyUseCase, UpdateCompanyDTO } from '@/domain/usecases/company/update-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NfeioCompanySync } from './nfeio-company-sync';

export class DbUpdateCompany implements UpdateCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioSync: NfeioCompanySync,
  ) {}

  async execute(data: UpdateCompanyDTO): Promise<CompanyModel> {
    const company = await this.companyRepository.findById(data.id);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    if (company.userId !== data.userId) {
      throw new Error('Você não tem permissão para editar esta empresa');
    }

    if (data.cnpj && data.cnpj !== company.cnpj) {
      const existingCompany = await this.companyRepository.findByUserIdAndCnpj(data.userId, data.cnpj);
      if (existingCompany) {
        throw new Error('Você já cadastrou uma empresa com este CNPJ');
      }
    }

    const { userId, id, dataAbertura, ...fields } = data;
    const updatedCompany = await this.companyRepository.update(id, {
      ...fields,
      dataAbertura: dataAbertura ? new Date(dataAbertura) : undefined,
    });

    // Mirror the stored data on NFe.io; a failure here must not block the local update.
    try {
      await this.nfeioSync.pushUpdate(updatedCompany);
    } catch (error: any) {
      console.error('[NFe.io] Falha ao atualizar empresa:', error.message);
    }

    return updatedCompany;
  }
}
