import { DeleteCompanyUseCase, DeleteCompanyDTO } from '@/domain/usecases/company/delete-company.usecase';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';

export class DbDeleteCompany implements DeleteCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol
  ) {}

  async execute(data: DeleteCompanyDTO): Promise<void> {
    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(data.id);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    // Verificar se pertence ao usuário
    if (company.userId !== data.userId) {
      throw new Error('Você não tem permissão para deletar esta empresa');
    }

    // Tentar deletar no NFe.io se tiver nfeioCompanyId
    if (company.nfeioCompanyId) {
      try {
        await this.nfeioService.deleteCompany(company.nfeioCompanyId);
      } catch (error: any) {
        console.error('Falha ao excluir empresa no NFe.io:', error.message);
      }
    }

    // Deletar empresa (cascade irá deletar as solicitações associadas)
    await this.companyRepository.delete(data.id);
  }
}
