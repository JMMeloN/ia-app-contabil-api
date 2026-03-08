import { ListRequestsUseCase, ListRequestsFilters } from '@/domain/usecases/request/list-requests.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { resolveInvoiceFileUrl } from './invoice-url-resolver';

export class DbListRequests implements ListRequestsUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol
  ) {}

  async execute(filters?: ListRequestsFilters): Promise<RequestModel[]> {
    const requests = await this.requestRepository.findMany(filters);

    const syncedRequests = await Promise.all(
      requests.map(async (request) => {
        if (
          request.status !== 'PROCESSADA' ||
          request.arquivoUrl ||
          !request.nfeioInvoiceId
        ) {
          return request;
        }

        const company = await this.companyRepository.findById(request.companyId);
        if (!company?.nfeioCompanyId) {
          return request;
        }

        try {
          const invoice = await this.nfeioService.getServiceInvoice(
            company.nfeioCompanyId,
            request.nfeioInvoiceId
          );
          const fileUrl = resolveInvoiceFileUrl(invoice);
          if (!fileUrl) {
            return request;
          }

          await this.requestRepository.updateStatus(request.id, {
            status: request.status,
            arquivoUrl: fileUrl,
          });

          return { ...request, arquivoUrl: fileUrl };
        } catch (error: any) {
          console.error(
            `Erro ao sincronizar arquivoUrl da solicitação ${request.id}:`,
            error.message
          );
          return request;
        }
      })
    );

    return syncedRequests;
  }
}
