import {
  GetInvoicePdfUrlDTO,
  InvoicePdfResult,
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

  async execute(data: GetInvoicePdfUrlDTO): Promise<InvoicePdfResult> {
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (data.requesterRole === 'CLIENTE' && request.userId !== data.requesterUserId) {
      throw new Error('Você não tem permissão para visualizar esta nota');
    }

    if (!request.nfeioInvoiceId) {
      if (request.arquivoUrl) {
        return { url: request.arquivoUrl };
      }
      throw new Error('Solicitação sem nota NFE.io vinculada');
    }

    const company = await this.companyRepository.findById(request.companyId);
    if (!company?.nfeioCompanyId) {
      if (request.arquivoUrl) {
        return { url: request.arquivoUrl };
      }
      throw new Error('Empresa não vinculada ao NFE.io');
    }
    const invoiceId = request.nfeioInvoiceId;

    let fileUrl: string | undefined;
    try {
      const invoice = await this.nfeioService.getServiceInvoice(
        company.nfeioCompanyId,
        invoiceId
      );
      fileUrl = resolveInvoiceFileUrl(invoice) || request.arquivoUrl || undefined;
    } catch {
      // tenta fallback por external id
    }

    if (!fileUrl) {
      try {
        fileUrl = await this.nfeioService.getServiceInvoicePdfUrl(
          company.nfeioCompanyId,
          invoiceId
        );
      } catch {
        // tenta fallback por external id
      }
    }

    if (!fileUrl) {
      try {
        const byExternal = await this.nfeioService.getServiceInvoiceByExternalId(
          company.nfeioCompanyId,
          request.id
        );
        fileUrl = resolveInvoiceFileUrl(byExternal);
      } catch {
        // segue fallback
      }
    }

    if (!fileUrl) {
      try {
        fileUrl = await this.nfeioService.getServiceInvoicePdfUrlByExternalId(
          company.nfeioCompanyId,
          request.id
        );
      } catch {
        // segue fallback
      }
    }

    if (fileUrl) {
      if (fileUrl !== request.arquivoUrl) {
        await this.requestRepository.updateStatus(request.id, {
          status: request.status,
          arquivoUrl: fileUrl,
        });
      }
      return { url: fileUrl };
    }

    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await this.nfeioService.getServiceInvoicePdfBinary(
        company.nfeioCompanyId,
        invoiceId
      );
    } catch {
      // handled below
    }

    if (pdfBuffer) {
      return {
        pdfBuffer,
        fileName: `NF-${request.id.substring(0, 8).toUpperCase()}.pdf`,
      };
    }

    throw new Error('PDF da nota ainda indisponível no NFE.io');
  }
}
