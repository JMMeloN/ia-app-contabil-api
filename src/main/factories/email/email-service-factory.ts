import { ResendEmailService } from '@/infra/email/resend-email-service';
import { env } from '@/main/config/env';

export class EmailServiceFactory {
  static make() {
    return new ResendEmailService(env.resendApiKey, env.resendFromEmail);
  }
}
