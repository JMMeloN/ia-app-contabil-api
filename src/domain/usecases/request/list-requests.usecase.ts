import { RequestModel } from '@/domain/models/request.model';

export interface ListRequestsFilters {
  userId?: string;
  status?: 'PENDENTE' | 'PROCESSADA' | 'CANCELADA';
}

export interface ListRequestsUseCase {
  execute(filters?: ListRequestsFilters): Promise<RequestModel[]>;
}
