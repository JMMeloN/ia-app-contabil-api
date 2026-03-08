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

    // Não permitir cancelar se já está cancelada
    if (request.status === 'CANCELADA') {
      throw new Error('Esta solicitação já está cancelada');
    }

    // Se já foi processada, só permite cancelar quando houver vínculo NFE.io
    // Regra solicitada: apenas cancelar localmente no banco (sem apagar/cancelar na NFE.io)
    if (request.status === 'PROCESSADA') {
      if (!request.nfeioInvoiceId) {
        throw new Error('Não é possível cancelar uma solicitação processada sem vínculo NFE.io');
      }
    }

    // Cancelar solicitação
    const cancelledRequest = await this.requestRepository.updateStatus(data.requestId, {
      status: 'CANCELADA',
    });

    return cancelledRequest;
  }
}
