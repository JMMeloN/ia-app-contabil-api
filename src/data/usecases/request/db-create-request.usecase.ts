import { CreateRequestUseCase, CreateRequestDTO } from '@/domain/usecases/request/create-request.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { UserRepository } from '@/data/protocols/user.repository';
import { EmailService } from '@/infra/email/resend-email-service';
import { novaSolicitacaoAdminEmailTemplate } from '@/infra/email/templates/nova-solicitacao-email';

export class DbCreateRequest implements CreateRequestUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService
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

    // Enviar email para o admin (iaappcontabil@gmail.com)
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
      // Não quebra o fluxo se o email falhar
    }

    return request;
  }
}
