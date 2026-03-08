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

    // Criar solicitação no banco local
    const request = await this.requestRepository.create(data);

    // Se emissão automática estiver habilitada E a empresa tiver configuração NFe.io
    if (data.emissaoAutomatica && company.nfeioCompanyId && (company.cityServiceCode || data.tomadorNome)) {
      try {
        console.log('Emitindo nota automaticamente para:', company.nome);

        // Usar dados do tomador informados ou fallback para a própria empresa (se for o caso)
        const borrower = {
          type: (data.tomadorDocumento?.replace(/\D/g, '').length || 0) > 11 ? 'LegalEntity' : 'NaturalPerson',
          federalTaxNumber: data.tomadorDocumento ? parseInt(data.tomadorDocumento.replace(/\D/g, '')) : parseInt(company.cnpj.replace(/\D/g, '')),
          name: data.tomadorNome || company.nome,
          email: data.tomadorEmail || company.email,
        };

        const invoice = await this.nfeioService.emitServiceInvoice({
          companyId: company.nfeioCompanyId!,
          cityServiceCode: company.cityServiceCode || '0',
          description: data.observacoes || 'Serviços prestados',
          servicesAmount: data.valor,
          borrower,
        });

        // Atualizar solicitação com dados da nota
        await this.requestRepository.updateStatus(request.id, {
          status: 'PROCESSADA',
          arquivoUrl: (invoice as any).pdfUrl || (invoice as any).xmlUrl || undefined,
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
            (invoice as any).number || 'Em processamento',
            (invoice as any).pdfUrl || '#'
          ),
        });

        console.log('Nota emitida automaticamente com sucesso!');
      } catch (error) {
        console.error('Erro ao emitir nota automaticamente:', error);
        // Se falhar emissão automática, envia email para admin processar manualmente
        this.notifyAdmin(user, company, data);
      }
    } else {
      // Fluxo normal ou dados insuficientes: notificar admin
      this.notifyAdmin(user, company, data);
    }

    return request;
  }

  private async notifyAdmin(user: any, company: any, data: CreateRequestDTO) {
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
}
