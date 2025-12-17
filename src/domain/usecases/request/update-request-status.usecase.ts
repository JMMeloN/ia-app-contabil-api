import { RequestModel, RequestStatus } from '@/domain/models/request.model';

export interface UpdateRequestStatusDTO {
  requestId: string;
  status: RequestStatus;
  arquivoUrl?: string;
}

export interface UpdateRequestStatusUseCase {
  execute(data: UpdateRequestStatusDTO): Promise<RequestModel>;
}
