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

      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: data.subject,
        html: data.html,
        attachments,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }
  }
}
