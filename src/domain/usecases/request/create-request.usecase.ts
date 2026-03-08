import { RequestModel } from '@/domain/models/request.model';

export interface CreateRequestDTO {
  valor: number;
  dataEmissao: Date;
  observacoes?: string;
  userId: string;
  companyId: string;
  emissaoAutomatica?: boolean;
  payerId?: string;
  // Compatibilidade com payload atual
  tomadorNome?: string;
  tomadorDocumento?: string;
  tomadorEmail?: string;
}

export interface CreateRequestUseCase {
  execute(data: CreateRequestDTO): Promise<RequestModel>;
}
