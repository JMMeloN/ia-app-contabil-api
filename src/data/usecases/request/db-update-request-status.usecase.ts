import { UpdateRequestStatusUseCase, UpdateRequestStatusDTO } from '@/domain/usecases/request/update-request-status.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';
import { UserRepository } from '@/data/protocols/user.repository';
import { CompanyRepository } from '@/data/protocols/company.repository';
import { EmailService } from '@/infra/email/resend-email-service';
import { notaProcessadaEmailTemplate } from '@/infra/email/templates/nota-processada-email';
import { env } from '@/main/config/env';
import path from 'path';
import axios from 'axios';

export class DbUpdateRequestStatus implements UpdateRequestStatusUseCase {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(data: UpdateRequestStatusDTO): Promise<RequestModel> {
    // Verificar se a solicitação existe
    const request = await this.requestRepository.findById(data.requestId);
    if (!request) {
      throw new Error('Solicitação não encontrada');
    }

    // Não permitir alterar status de solicitação cancelada
    if (request.status === 'CANCELADA') {
      throw new Error('Não é possível alterar o status de uma solicitação cancelada');
    }

    // Atualizar status
    const updatedRequest = await this.requestRepository.updateStatus(data.requestId, {
      status: data.status,
      arquivoUrl: data.arquivoUrl,
      processadoEm: data.status === 'PROCESSADA' ? new Date() : undefined,
    });

    // Se foi processada, enviar email para o usuário com a nota em anexo
    if (data.status === 'PROCESSADA' && data.arquivoUrl) {
      try {
        console.log('📧 Iniciando envio de email para nota processada. arquivoUrl:', data.arquivoUrl);

        // Buscar dados do usuário e empresa
        const user = await this.userRepository.findById(request.userId);
        const company = await this.companyRepository.findById(request.companyId);

        if (!user || !company) {
          console.error('❌ Usuário ou empresa não encontrados:', { userId: request.userId, companyId: request.companyId });
          throw new Error('Dados não encontrados para envio de email');
        }

        console.log('✅ Usuário e empresa encontrados:', { userEmail: user.email, companyName: company.nome });

        // Gerar número da nota (baseado no ID)
        const notaNumero = `NF-${request.id.substring(0, 8).toUpperCase()}`;

        // URL completo para download
        // Se arquivoUrl já é completo (Cloudinary), usar diretamente
        const downloadUrl = data.arquivoUrl.startsWith('http')
          ? data.arquivoUrl
          : `${env.nodeEnv === 'production'
              ? 'https://iacontabil-api.onrender.com'
              : `http://localhost:${env.port}`}${data.arquivoUrl}`;

        console.log('🔗 Download URL:', downloadUrl);

        // Preparar anexo (suporta URL remota ou arquivo local)
        let attachmentContent: Buffer | undefined;
        let attachmentPath: string | undefined;

        if (data.arquivoUrl.startsWith('http')) {
          console.log('📥 Baixando arquivo do Cloudinary...', data.arquivoUrl);
          try {
            // Baixar arquivo do Cloudinary ou servidor remoto com timeout
            const response = await axios.get(data.arquivoUrl, {
              responseType: 'arraybuffer',
              timeout: 30000, // 30 segundos
              maxContentLength: 10 * 1024 * 1024, // 10MB max
            });
            attachmentContent = Buffer.from(response.data);
            console.log('✅ Arquivo baixado com sucesso. Tamanho:', attachmentContent.length, 'bytes');
          } catch (downloadError: any) {
            console.error('❌ Erro ao baixar arquivo do Cloudinary:', downloadError.message);
            console.error('❌ URL:', data.arquivoUrl);
            throw new Error(`Falha ao baixar arquivo: ${downloadError.message}`);
          }
        } else {
          console.log('📂 Usando arquivo local');
          // Arquivo local
          attachmentPath = path.resolve(__dirname, '../../../..', data.arquivoUrl.replace('/files/', 'uploads/'));
          console.log('📂 Caminho local:', attachmentPath);
        }

        console.log('📤 Enviando email com anexo...');

        // Enviar email com anexo
        await this.emailService.send({
          to: user.email,
          subject: `✅ Nota Fiscal Processada - ${company.nome}`,
          html: notaProcessadaEmailTemplate(
            user.name,
            company.nome,
            request.valor,
            notaNumero,
            downloadUrl
          ),
          attachments: [
            {
              filename: `${notaNumero}.pdf`,
              content: attachmentContent,
              path: attachmentPath,
            },
          ],
        });

        console.log('✅ Email enviado com sucesso para:', user.email);
      } catch (error: any) {
        console.error('❌ Erro ao enviar email de nota processada:', error);
        console.error('❌ Stack trace:', error?.stack);
        console.error('❌ Error message:', error?.message);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        // Não quebra o fluxo se o email falhar
      }
    }

    return updatedRequest;
  }
}
