import { DbCreateRequest } from '@/data/usecases/request/db-create-request.usecase';
import { DbListRequests } from '@/data/usecases/request/db-list-requests.usecase';
import { DbUpdateRequestStatus } from '@/data/usecases/request/db-update-request-status.usecase';
import { DbCancelRequest } from '@/data/usecases/request/db-cancel-request.usecase';
import { PrismaRequestRepository } from '@/infra/db/prisma/request.repository';
import { PrismaCompanyRepository } from '@/infra/db/prisma/company.repository';

export function makeCreateRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const companyRepository = new PrismaCompanyRepository();
  return new DbCreateRequest(requestRepository, companyRepository);
}

export function makeListRequestsUseCase() {
  const requestRepository = new PrismaRequestRepository();
  return new DbListRequests(requestRepository);
}

export function makeUpdateRequestStatusUseCase() {
  const requestRepository = new PrismaRequestRepository();
  return new DbUpdateRequestStatus(requestRepository);
}

export function makeCancelRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  return new DbCancelRequest(requestRepository);
}
