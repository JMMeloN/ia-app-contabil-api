import {
  GetInvoicePdfUrlDTO,
  GetInvoicePdfUrlUseCase,
} from '@/domain/usecases/request/get-invoice-pdf-url.usecase';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { resolveInvoiceFileUrl } from './invoice-url-resolver';

export class DbGetInvoicePdfUrl implements GetInvoicePdfUrlUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly nfeioService: NFEIOServiceProtocol
  ) {}

  async execute(data: GetInvoicePdfUrlDTO): Promise<string> {
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (data.requesterRole === 'CLIENTE' && request.userId !== data.requesterUserId) {
      throw new Error('Você não tem permissão para visualizar esta nota');
    }

    if (!request.nfeioInvoiceId) {
      if (request.arquivoUrl) {
        return request.arquivoUrl;
      }
      throw new Error('Solicitação sem nota NFE.io vinculada');
    }

    const company = await this.companyRepository.findById(request.companyId);
    if (!company?.nfeioCompanyId) {
      if (request.arquivoUrl) {
        return request.arquivoUrl;
      }
      throw new Error('Empresa não vinculada ao NFE.io');
    }

    const invoice = await this.nfeioService.getServiceInvoice(
      company.nfeioCompanyId,
      request.nfeioInvoiceId
    );

    const fileUrl = resolveInvoiceFileUrl(invoice) || request.arquivoUrl;
    if (!fileUrl) {
      throw new Error('PDF da nota ainda indisponível no NFE.io');
    }

    if (fileUrl !== request.arquivoUrl) {
      await this.requestRepository.updateStatus(request.id, {
        status: request.status,
        arquivoUrl: fileUrl,
      });
    }

    return fileUrl;
  }
}
