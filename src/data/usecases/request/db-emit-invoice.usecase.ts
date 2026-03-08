import { EmitInvoiceUseCase, EmitInvoiceDTO } from '@/domain/usecases/request/emit-invoice.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { UserRepository } from '@/data/protocols/user.repository';
import { NFEIOServiceProtocol } from '@/data/protocols/nfeio.service';
import { EmailService } from '@/infra/email/resend-email-service';
import { notaProcessadaEmailTemplate } from '@/infra/email/templates/nota-processada-email';
import { PayerRepository } from '@/data/protocols/payer.repository';
import { resolveBorrower } from './payer-resolver';

export class DbEmitInvoice implements EmitInvoiceUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    private readonly nfeioService: NFEIOServiceProtocol,
    private readonly emailService: EmailService,
    private readonly payerRepository: PayerRepository
  ) {}

  async execute(data: EmitInvoiceDTO): Promise<RequestModel> {
    // 1. Buscar a solicitação
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    if (request.status === 'CANCELADA') {
      throw new Error('Não é possível emitir nota para solicitação cancelada');
    }

    // 2. Buscar dados da empresa (Emissora)
    const company = await this.companyRepository.findById(request.companyId);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    if (!company.nfeioCompanyId) {
      throw new Error('Empresa não vinculada ao NFe.io. Vincule-a primeiro.');
    }

    // 3. Buscar dados do usuário (Dono da conta)
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    let payer = null;
    if (request.payerId) {
      payer = await this.payerRepository.findById(request.payerId);
    }

    // 4. Montar dados do tomador (borrower) com base no request/payer
    const borrower = resolveBorrower(company, { payer, request });

    // 5. Emitir nota fiscal via nfe.io
    // Nota: O nfeioService agora precisa saber qual empresa está emitindo se não for a padrão
    // No NFEIOService, a URL de emissão usa o companyId na rota
    let invoice;
    try {
      // Criamos uma instância específica para esta empresa ou passamos o ID na chamada
      // Como o protocolo é genérico, vamos assumir que o nfeioService lida com o ID da empresa emissora internamente 
      // ou que precisamos de um método que aceite o emissorId
      
      // Ajustando para o novo mapeamento de campos
      invoice = await this.nfeioService.emitServiceInvoice({
        companyId: company.nfeioCompanyId,
        cityServiceCode: data.cityServiceCode || company.cityServiceCode || '0',
        description: request.observacoes || 'Serviços prestados',
        servicesAmount: request.valor,
        borrower,
      });

      console.log('Nota fiscal enviada para processamento no NFe.io:', invoice);
    } catch (error: any) {
      console.error('Erro ao emitir nota fiscal:', error.message);
      throw new Error(`Falha ao emitir nota fiscal: ${error.message}`);
    }

    // 6. Atualizar solicitação com status inicial
    const nfeioId = (invoice as any).id || (invoice as any).companies?.id;
    
    const updatedRequest = await this.requestRepository.updateStatus(data.requestId, {
      status: 'PROCESSADA',
      arquivoUrl: (invoice as any).pdfUrl || undefined,
      processadoEm: new Date(),
      nfeioInvoiceId: nfeioId,
    });

    // 7. Enviar email para o cliente
    try {
      await this.emailService.send({
        to: user.email,
        subject: `✅ Nota Fiscal Emitida - ${company.nome}`,
        html: notaProcessadaEmailTemplate(
          user.name,
          company.nome,
          request.valor,
          (invoice as any).number || 'Em processamento',
          (invoice as any).pdfUrl || '#'
        ),
      });
    } catch (error) {
      console.error('Erro ao enviar email para cliente:', error);
    }

    return updatedRequest;
  }
}
