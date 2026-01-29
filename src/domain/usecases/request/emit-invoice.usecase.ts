import { RequestModel } from '@/domain/models/request.model';

export interface EmitInvoiceDTO {
  requestId: string;
  userId: string; // Para verificar permissões
  cityServiceCode: string; // Código do serviço municipal
}

export interface EmitInvoiceUseCase {
  execute(data: EmitInvoiceDTO): Promise<RequestModel>;
}
