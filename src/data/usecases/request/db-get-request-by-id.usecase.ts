import { GetRequestByIdUseCase } from '@/domain/usecases/request/get-request-by-id.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';

export class DbGetRequestById implements GetRequestByIdUseCase {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(requestId: string, userId?: string): Promise<RequestModel> {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    // Se for cliente, só pode ver suas próprias solicitações
    if (userId && request.userId !== userId) {
      throw new Error('Você não tem permissão para visualizar esta solicitação');
    }

    return request;
  }
}
