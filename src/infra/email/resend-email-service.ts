import { Resend } from 'resend';
import fs from 'fs';

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface EmailService {
  send(data: EmailData): Promise<void>;
}

export interface EmailService {
  send(data: EmailData): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async send(data: EmailData): Promise<void> {
    try {
      const attachments = data.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content ?? (att.path ? fs.readFileSync(att.path) : Buffer.from('')),
      }));

      console.log('📧 Enviando email via Resend:', {
        from: this.fromEmail,
        to: data.to,
        subject: data.subject,
        hasAttachments: !!attachments?.length,
        attachmentsCount: attachments?.length || 0,
      });

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: data.subject,
        html: data.html,
        attachments,
      });

      console.log('✅ Resend retornou sucesso:', result);
      console.log('⚠️ IMPORTANTE: Se você está usando onboarding@resend.dev, o email só será enviado para endereços verificados no Resend.');
    } catch (error: any) {
      console.error('❌ Erro ao enviar email via Resend:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error response:', error?.response?.data);
      throw new Error(`Falha ao enviar email: ${error?.message || 'Erro desconhecido'}`);
    }
  }
}
