import { CreateRequestUseCase, CreateRequestDTO } from '@/domain/usecases/request/create-request.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { UserRepository } from '@/data/protocols/user.repository';
import { EmailService } from '@/infra/email/resend-email-service';
import { NFEIOService } from '@/infra/nfeio/nfeio.service';
import { notaProcessadaEmailTemplate } from '@/infra/email/templates/nota-processada-email';
import { PayerRepository } from '@/data/protocols/payer.repository';
import { resolveBorrower } from './payer-resolver';
import { resolveInvoiceFileUrl } from './invoice-url-resolver';
import axios from 'axios';
import { randomUUID } from 'crypto';

export class DbCreateRequest implements CreateRequestUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly nfeioService: NFEIOService,
    private readonly payerRepository: PayerRepository
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

    // Buscar dados do usuário
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const payer = await this.payerRepository.findById(data.payerId);
    if (!payer || payer.userId !== data.userId) {
      throw new Error('Tomador inválido para este usuário');
    }

    if (payer.companyId !== company.id) {
      throw new Error('Tomador inválido para esta empresa');
    }

    if (!company.nfeioCompanyId) {
      throw new Error('Empresa não vinculada ao NFe.io.');
    }

    if (!company.cityServiceCode) {
      throw new Error('Empresa sem código de serviço municipal configurado.');
    }

    if (typeof data.issRate !== 'number' || Number.isNaN(data.issRate)) {
      throw new Error('Alíquota ISS é obrigatória.');
    }

    const borrower = resolveBorrower(company, {
      payer,
      tomadorNome: data.tomadorNome,
      tomadorDocumento: data.tomadorDocumento,
      tomadorEmail: data.tomadorEmail,
    });

    // Criar solicitação no banco local
    const request = await this.requestRepository.create({
      valor: data.valor,
      dataEmissao: data.dataEmissao,
      observacoes: data.observacoes,
      cnaeCode: data.cnaeCode,
      issRate: data.issRate,
      userId: data.userId,
      companyId: data.companyId,
      payerId: payer.id,
      cityServiceCode: company.cityServiceCode || undefined,
      tomadorNome: borrower.name,
      tomadorDocumento: String(borrower.federalTaxNumber),
      tomadorEmail: borrower.email,
      tomadorEndereco: payer.endereco || undefined,
      tomadorCidade: payer.cidade || undefined,
      tomadorEstado: payer.estado || undefined,
      tomadorCep: payer.cep || undefined,
      externalId: randomUUID(),
    });
    try {
      const invoice = await this.nfeioService.emitServiceInvoice({
        companyId: company.nfeioCompanyId,
        cityServiceCode: company.cityServiceCode,
        cnaeCode: data.cnaeCode,
        issRate: data.issRate,
        description: data.observacoes || 'Serviços prestados',
        servicesAmount: data.valor,
        borrower,
      });

      const nfeioId = (invoice as any).id || (invoice as any).companies?.id;
      let fileUrl = resolveInvoiceFileUrl(invoice);

      if (!fileUrl && nfeioId) {
        try {
          const fullInvoice = await this.nfeioService.getServiceInvoice(company.nfeioCompanyId, nfeioId);
          fileUrl = resolveInvoiceFileUrl(fullInvoice);
        } catch (error: any) {
          console.error('Falha ao buscar PDF da nota na NFE.io:', error.message);
        }
      }

      const updatedRequest = await this.requestRepository.updateStatus(request.id, {
        status: 'PROCESSADA',
        arquivoUrl: fileUrl,
        processadoEm: new Date(),
        nfeioInvoiceId: nfeioId,
      });

      let attachments: Array<{ filename: string; content: Buffer }> | undefined;
      if (fileUrl?.startsWith('http')) {
        try {
          const pdfResponse = await axios.get(fileUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            maxContentLength: 10 * 1024 * 1024,
          });
          attachments = [
            {
              filename: `NF-${request.id.substring(0, 8).toUpperCase()}.pdf`,
              content: Buffer.from(pdfResponse.data),
            },
          ];
        } catch (error: any) {
          console.error('Falha ao baixar PDF para anexo no email:', error.message);
        }
      }

      await this.emailService.send({
        to: user.email,
        subject: `✅ Nota Fiscal Emitida - ${company.nome}`,
        html: notaProcessadaEmailTemplate(
          user.name,
          company.nome,
          data.valor,
          (invoice as any).number || 'Em processamento',
          fileUrl
        ),
        attachments,
      });

      return updatedRequest;
    } catch (error: any) {
      await this.requestRepository.updateStatus(request.id, {
        status: 'FALHA',
        errorMessage: error.message,
      });
      throw new Error(`Falha ao emitir nota fiscal: ${error.message}`);
    }
  }
}
