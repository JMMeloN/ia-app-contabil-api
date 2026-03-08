import { RequestModel, RequestStatus } from '@/domain/models/request.model';

export interface CreateRequestData {
  valor: number;
  dataEmissao: Date;
  observacoes?: string;
  userId: string;
  companyId: string;
  emissaoAutomatica?: boolean;
  payerId?: string;
  tomadorNome?: string;
  tomadorDocumento?: string;
  tomadorEmail?: string;
}

export interface UpdateRequestStatusData {
  status: RequestStatus;
  arquivoUrl?: string;
  processadoEm?: Date;
  nfeioInvoiceId?: string;
}

export interface FindRequestsFilters {
  userId?: string;
  status?: RequestStatus;
}

export interface RequestRepository {
  create(data: CreateRequestData): Promise<RequestModel>;
  findById(id: string): Promise<RequestModel | null>;
  findMany(filters?: FindRequestsFilters): Promise<RequestModel[]>;
  updateStatus(id: string, data: UpdateRequestStatusData): Promise<RequestModel>;
}
