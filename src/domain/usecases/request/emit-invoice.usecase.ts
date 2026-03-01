import { RequestModel } from '@/domain/models/request.model';

export interface EmitInvoiceDTO {
  requestId: string;
  userId: string;
  cityServiceCode?: string; // Opcional, usa o da empresa se não informado
}

export interface EmitInvoiceUseCase {
  execute(data: EmitInvoiceDTO): Promise<RequestModel>;
}
