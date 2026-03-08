import { GetRequestByIdUseCase } from '@/domain/usecases/request/get-request-by-id.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { resolveInvoiceFileUrl } from './invoice-url-resolver';

export class DbGetRequestById implements GetRequestByIdUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol
  ) {}

  async execute(requestId: string, userId?: string): Promise<RequestModel> {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    // Se for cliente, só pode ver suas próprias solicitações
    if (userId && request.userId !== userId) {
      throw new Error('Você não tem permissão para visualizar esta solicitação');
    }

    if (
      request.status === 'PROCESSADA' &&
      !request.arquivoUrl &&
      request.nfeioInvoiceId
    ) {
      const company = await this.companyRepository.findById(request.companyId);
      if (company?.nfeioCompanyId) {
        try {
          const invoice = await this.nfeioService.getServiceInvoice(
            company.nfeioCompanyId,
            request.nfeioInvoiceId
          );
          const fileUrl = resolveInvoiceFileUrl(invoice);
          if (fileUrl) {
            await this.requestRepository.updateStatus(request.id, {
              status: request.status,
              arquivoUrl: fileUrl,
            });
            return { ...request, arquivoUrl: fileUrl };
          }
        } catch (error: any) {
          console.error('Erro ao sincronizar arquivoUrl da NFE.io:', error.message);
        }
      }
    }

    return request;
  }
}
