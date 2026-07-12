import { RequestModel, RequestStatus } from '@/domain/models/request.model';

export interface CreateRequestData {
  valor: number;
  dataEmissao: Date;
  observacoes?: string;
  cnaeCode?: string;
  userId: string;
  companyId: string;
  emissaoAutomatica?: boolean;
  payerId: string;
  cityServiceCode?: string;
  tomadorNome?: string;
  tomadorDocumento?: string;
  tomadorEmail?: string;
  tomadorEndereco?: string;
  tomadorCidade?: string;
  tomadorEstado?: string;
  tomadorCep?: string;
  externalId?: string;
}

export interface UpdateRequestStatusData {
  status: RequestStatus;
  arquivoUrl?: string;
  xmlUrl?: string;
  cancelamentoXmlUrl?: string;
  processadoEm?: Date;
  canceladoEm?: Date;
  nfeioInvoiceId?: string;
  numeroNota?: string;
  codigoVerificacao?: string;
  errorMessage?: string;
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
