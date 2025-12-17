import { UpdateRequestStatusUseCase, UpdateRequestStatusDTO } from '@/domain/usecases/request/update-request-status.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';

export class DbUpdateRequestStatus implements UpdateRequestStatusUseCase {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(data: UpdateRequestStatusDTO): Promise<RequestModel> {
    // Verificar se a solicitação existe
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    // Não permitir alterar status de solicitação cancelada
    if (request.status === 'CANCELADA') {
      throw new Error('Não é possível alterar o status de uma solicitação cancelada');
    }

    // Atualizar status
    const updatedRequest = await this.requestRepository.updateStatus(data.requestId, {
      status: data.status,
      arquivoUrl: data.arquivoUrl,
      processadoEm: data.status === 'PROCESSADA' ? new Date() : undefined,
    });

    return updatedRequest;
  }
}
