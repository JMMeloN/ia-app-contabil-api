import { CancelRequestUseCase, CancelRequestDTO } from '@/domain/usecases/request/cancel-request.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';

export class DbCancelRequest implements CancelRequestUseCase {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(data: CancelRequestDTO): Promise<RequestModel> {
    // Verificar se a solicitação existe
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    // Verificar se pertence ao usuário
    if (request.userId !== data.userId) {
      throw new Error('Você não tem permissão para cancelar esta solicitação');
    }

    // Não permitir cancelar se já foi processada
    if (request.status === 'PROCESSADA') {
      throw new Error('Não é possível cancelar uma solicitação já processada');
    }

    // Não permitir cancelar se já está cancelada
    if (request.status === 'CANCELADA') {
      throw new Error('Esta solicitação já está cancelada');
    }

    // Cancelar solicitação
    const cancelledRequest = await this.requestRepository.updateStatus(data.requestId, {
      status: 'CANCELADA',
    });

    return cancelledRequest;
  }
}
