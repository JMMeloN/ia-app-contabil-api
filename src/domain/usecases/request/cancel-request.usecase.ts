import { RequestModel } from '@/domain/models/request.model';

export interface CancelRequestDTO {
  requestId: string;
  userId: string;
}

export interface CancelRequestUseCase {
  execute(data: CancelRequestDTO): Promise<RequestModel>;
}
