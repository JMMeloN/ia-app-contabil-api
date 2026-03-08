import { UserRole } from '@/domain/models/user.model';

export interface GetInvoicePdfUrlDTO {
  requestId: string;
  requesterUserId: string;
  requesterRole: UserRole;
}

export interface InvoicePdfResult {
  url?: string;
  pdfBuffer?: Buffer;
  fileName?: string;
}

export interface GetInvoicePdfUrlUseCase {
  execute(data: GetInvoicePdfUrlDTO): Promise<InvoicePdfResult>;
}
