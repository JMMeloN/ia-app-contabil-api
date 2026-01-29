import { EmitInvoiceUseCase, EmitInvoiceDTO } from '@/domain/usecases/request/emit-invoice.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { UserRepository } from '@/data/protocols/user.repository';
import { NFEIOService, NFEIOBorrower } from '@/infra/nfeio/nfeio.service';
import { EmailService } from '@/infra/email/resend-email-service';
import { notaProcessadaEmailTemplate } from '@/infra/email/templates/nota-processada-email';

export class DbEmitInvoice implements EmitInvoiceUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    private readonly nfeioService: NFEIOService,
    private readonly emailService: EmailService
  ) {}

  async execute(data: EmitInvoiceDTO): Promise<RequestModel> {
    // 1. Buscar a solicitação
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    // 2. Verificar status (só pode emitir se estiver PENDENTE ou PROCESSADA sem nota)
    if (request.status === 'CANCELADA') {
      throw new Error('Não é possível emitir nota para solicitação cancelada');
    }

    // 3. Buscar dados da empresa
    const company = await this.companyRepository.findById(request.companyId);
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    // 4. Buscar dados do usuário (cliente que solicitou)
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // 5. Montar dados do tomador (borrower) - Cliente que vai receber a nota
    const borrower: NFEIOBorrower = {
      type: 'LegalEntity', // Pessoa Jurídica
      federalTaxNumber: parseInt(company.cnpj.replace(/\D/g, '')), // CNPJ apenas números
      name: company.nome,
      email: company.email,
      address: {
        country: 'BRA',
        postalCode: company.cep.replace(/\D/g, ''),
        street: company.endereco,
        number: 'S/N', // Você pode extrair do endereço se necessário
        district: 'Centro', // Você pode adicionar este campo ao modelo Company
        city: {
          code: '0000000', // Código IBGE - você precisará mapear ou buscar
          name: company.cidade,
        },
        state: company.estado,
      },
    };

    // 6. Emitir nota fiscal via nfe.io
    let invoice;
    try {
      invoice = await this.nfeioService.emitServiceInvoice({
        cityServiceCode: data.cityServiceCode,
        description: request.observacoes || 'Serviços de consultoria contábil',
        servicesAmount: request.valor,
        borrower,
      });

      console.log('Nota fiscal emitida com sucesso:', invoice);
    } catch (error: any) {
      console.error('Erro ao emitir nota fiscal:', error);
      throw new Error(`Falha ao emitir nota fiscal: ${error.message}`);
    }

    // 7. Atualizar solicitação com dados da nota fiscal
    const updatedRequest = await this.requestRepository.updateStatus(data.requestId, {
      status: 'PROCESSADA',
      arquivoUrl: invoice.pdfUrl || invoice.xmlUrl || undefined,
      processadoEm: new Date(),
    });

    // 8. Enviar email para o cliente notificando que a nota foi emitida
    try {
      await this.emailService.send({
        to: user.email,
        subject: `✅ Nota Fiscal Emitida - ${company.nome}`,
        html: notaProcessadaEmailTemplate(
          user.name,
          company.nome,
          request.valor,
          invoice.number || 'Em processamento',
          invoice.pdfUrl || '#'
        ),
      });

      console.log('Email enviado para o cliente:', user.email);
    } catch (error) {
      console.error('Erro ao enviar email para cliente:', error);
      // Não quebra o fluxo se o email falhar
    }

    return updatedRequest;
  }
}
