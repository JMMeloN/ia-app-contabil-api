import { UpdateCompanyUseCase, UpdateCompanyDTO } from '@/domain/usecases/company/update-company.usecase';
import { CompanyModel } from '@/domain/models/company.model';
import { CompanyRepository, UpdateCompanyData } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';

export class DbUpdateCompany implements UpdateCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol
  ) {}

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

    // Se estiver alterando o CNPJ, verificar se o usuário já tem outra empresa com este CNPJ
    if (data.cnpj && data.cnpj !== company.cnpj) {
      const existingCompany = await this.companyRepository.findByUserIdAndCnpj(data.userId, data.cnpj);
      if (existingCompany) {
        throw new Error('Você já cadastrou uma empresa com este CNPJ');
      }
    }

    // Tentar atualizar no NFe.io se tiver nfeioCompanyId
    if (company.nfeioCompanyId) {
      try {
        await this.nfeioService.updateCompany(company.nfeioCompanyId, {
          name: data.nome || company.nome,
          federalTaxNumber: Number((data.cnpj || company.cnpj).replace(/\D/g, '')),
          email: data.email || company.email,
          address: {
            postalCode: (data.cep || company.cep).replace(/\D/g, ''),
            street: (data.endereco || company.endereco).split(',')[0],
            number: (data.endereco || company.endereco).split(',')[1]?.trim() || 'S/N',
            district: 'Centro',
            city: {
              code: '3550308',
              name: data.cidade || company.cidade
            },
            state: data.estado || company.estado
          },
          openningDate: new Date().toISOString(),
          municipalTaxNumber: '',
          taxRegime: 'Isento',
          legalNature: 'EmpresaIndividualImobiliaria',
          environment: 'Development'
        });
      } catch (error: any) {
        console.error('Falha ao atualizar empresa no NFe.io:', error.message);
      }
    }

    // Preparar dados para o repositório
    const { userId, id, ...updateDTO } = data;
    const updateData: UpdateCompanyData = { ...updateDTO };

    // Atualizar empresa no banco local
    const updatedCompany = await this.companyRepository.update(data.id, updateData);

    return updatedCompany;
  }
}
