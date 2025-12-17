import { RequestModel, RequestStatus } from '@/domain/models/request.model';

export interface CreateRequestData {
  valor: number;
  dataEmissao: Date;
  observacoes?: string;
  userId: string;
  companyId: string;
}

export interface UpdateRequestStatusData {
  status: RequestStatus;
  arquivoUrl?: string;
  processadoEm?: Date;
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
