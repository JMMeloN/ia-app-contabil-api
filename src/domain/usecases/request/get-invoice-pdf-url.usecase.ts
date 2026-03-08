import { UserRole } from '@/domain/models/user.model';

export interface GetInvoicePdfUrlDTO {
  requestId: string;
  requesterUserId: string;
  requesterRole: UserRole;
}

export interface GetInvoicePdfUrlUseCase {
  execute(data: GetInvoicePdfUrlDTO): Promise<string>;
}
