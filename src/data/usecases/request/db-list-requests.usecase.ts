import { ListRequestsUseCase, ListRequestsFilters } from '@/domain/usecases/request/list-requests.usecase';
import { RequestModel } from '@/domain/models/request.model';
import { RequestRepository } from '@/data/protocols/request.repository';

export class DbListRequests implements ListRequestsUseCase {
  constructor(private readonly requestRepository: RequestRepository) {}

  async execute(filters?: ListRequestsFilters): Promise<RequestModel[]> {
    const requests = await this.requestRepository.findMany(filters);
    return requests;
  }
}
