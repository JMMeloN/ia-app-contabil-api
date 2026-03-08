import {
  CancelNfeioInvoiceDTO,
  CancelNfeioInvoiceUseCase,
} from '@/domain/usecases/request/cancel-nfeio-invoice.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';

export class DbCancelNfeioInvoice implements CancelNfeioInvoiceUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol,
  ) {}

  async execute(data: CancelNfeioInvoiceDTO): Promise<RequestModel> {
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (data.role === 'CLIENTE' && request.userId !== data.userId) {
      throw new Error('Você não tem permissão para cancelar esta nota');
    }

    if (request.status === 'CANCELADA') {
      throw new Error('Esta solicitação já está cancelada');
    }

    if (!request.nfeioInvoiceId) {
      throw new Error('Solicitação sem nota vinculada no NFE.io');
    }

    const company = await this.companyRepository.findById(request.companyId);
    if (!company || !company.nfeioCompanyId) {
      throw new Error('Empresa não vinculada ao NFE.io');
    }

    await this.nfeioService.cancelServiceInvoice(company.nfeioCompanyId, request.nfeioInvoiceId);

    return this.requestRepository.updateStatus(request.id, {
      status: 'CANCELADA',
    });
  }
}
