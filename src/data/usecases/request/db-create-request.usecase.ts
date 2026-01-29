import { CreateRequestUseCase, CreateRequestDTO } from '@/domain/usecases/request/create-request.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { UserRepository } from '@/data/protocols/user.repository';
import { EmailService } from '@/infra/email/resend-email-service';
import { novaSolicitacaoAdminEmailTemplate } from '@/infra/email/templates/nova-solicitacao-email';
import { NFEIOService } from '@/infra/nfeio/nfeio.service';
import { notaProcessadaEmailTemplate } from '@/infra/email/templates/nota-processada-email';

export class DbCreateRequest implements CreateRequestUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly nfeioService: NFEIOService
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

    // Criar solicitação
    const request = await this.requestRepository.create(data);

    // Se emissão automática estiver habilitada E a empresa tiver configuração NFe.io
    if (data.emissaoAutomatica && company.nfeioCompanyId && company.cityServiceCode) {
      try {
        console.log('Emitindo nota automaticamente para:', company.nome);

        // Emitir nota fiscal automaticamente
        const nfeioService = new NFEIOService(undefined, company.nfeioCompanyId);

        const invoice = await nfeioService.emitServiceInvoice({
          cityServiceCode: company.cityServiceCode,
          description: data.observacoes || 'Serviços prestados',
          servicesAmount: data.valor,
          borrower: {
            type: 'LegalEntity',
            federalTaxNumber: parseInt(company.cnpj.replace(/\D/g, '')),
            name: company.nome,
            email: company.email,
          },
        });

        // Atualizar solicitação com dados da nota
        await this.requestRepository.updateStatus(request.id, {
          status: 'PROCESSADA',
          arquivoUrl: invoice.pdfUrl || invoice.xmlUrl || undefined,
          processadoEm: new Date(),
        });

        // Enviar email para o cliente com a nota
        await this.emailService.send({
          to: user.email,
          subject: `✅ Nota Fiscal Emitida - ${company.nome}`,
          html: notaProcessadaEmailTemplate(
            user.name,
            company.nome,
            data.valor,
            invoice.number || 'Em processamento',
            invoice.pdfUrl || '#'
          ),
        });

        console.log('Nota emitida automaticamente com sucesso!');
      } catch (error) {
        console.error('Erro ao emitir nota automaticamente:', error);
        // Se falhar emissão automática, envia email para admin processar manualmente
        try {
          await this.emailService.send({
            to: 'iaappcontabil@gmail.com',
            subject: `⚠️ Falha na Emissão Automática - ${company.nome}`,
            html: novaSolicitacaoAdminEmailTemplate(
              user.name,
              user.email,
              company.nome,
              company.cnpj,
              data.valor,
              data.dataEmissao instanceof Date ? data.dataEmissao.toISOString() : data.dataEmissao,
              data.observacoes || ''
            ),
          });
        } catch (emailError) {
          console.error('Erro ao enviar email para admin:', emailError);
        }
      }
    } else if (!data.emissaoAutomatica) {
      // Fluxo normal: enviar email para o admin processar manualmente
      try {
        await this.emailService.send({
          to: 'iaappcontabil@gmail.com',
          subject: `🔔 Nova Solicitação de Nota Fiscal - ${company.nome}`,
          html: novaSolicitacaoAdminEmailTemplate(
            user.name,
            user.email,
            company.nome,
            company.cnpj,
            data.valor,
            data.dataEmissao instanceof Date ? data.dataEmissao.toISOString() : data.dataEmissao,
            data.observacoes || ''
          ),
        });
      } catch (error) {
        console.error('Erro ao enviar email para admin:', error);
      }
    }

    return request;
  }
}
