import { RequestModel } from '@/domain/models/request.model';

export interface GetRequestByIdUseCase {
  execute(requestId: string, userId?: string): Promise<RequestModel>;
}
