import { CreateRequestUseCase, CreateRequestDTO } from '@/domain/usecases/request/create-request.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';

export class DbCreateRequest implements CreateRequestUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(data: CreateRequestDTO): Promise<RequestModel> {
    // Verificar se a empresa existe e pertence ao usuário
    const company = await this.companyRepository.findById(data.companyId);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    if (company.userId !== data.userId) {
      throw new Error('Você não tem permissão para usar esta empresa');
    }

    // Criar solicitação
    const request = await this.requestRepository.create(data);

    return request;
  }
}
