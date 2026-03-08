import { RequestModel } from '@/domain/models/request.model';
import { UserRole } from '@/domain/models/user.model';

export interface CancelNfeioInvoiceDTO {
  requestId: string;
  userId: string;
  role: UserRole;
}

export interface CancelNfeioInvoiceUseCase {
  execute(data: CancelNfeioInvoiceDTO): Promise<RequestModel>;
}
