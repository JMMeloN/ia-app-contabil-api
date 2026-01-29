import { DbCreateRequest } from '@/data/usecases/request/db-create-request.usecase';
import { DbListRequests } from '@/data/usecases/request/db-list-requests.usecase';
import { DbGetRequestById } from '@/data/usecases/request/db-get-request-by-id.usecase';
import { DbUpdateRequestStatus } from '@/data/usecases/request/db-update-request-status.usecase';
import { DbCancelRequest } from '@/data/usecases/request/db-cancel-request.usecase';
import { DbEmitInvoice } from '@/data/usecases/request/db-emit-invoice.usecase';
import { PrismaRequestRepository } from '@/infra/db/prisma/request.repository';
import { PrismaCompanyRepository } from '@/infra/db/prisma/company.repository';
import { PrismaUserRepository } from '@/infra/db/prisma/user.repository';
import { EmailServiceFactory } from '@/main/factories/email/email-service-factory';
import { NFEIOService } from '@/infra/nfeio/nfeio.service';

export function makeCreateRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const companyRepository = new PrismaCompanyRepository();
  const userRepository = new PrismaUserRepository();
  const emailService = EmailServiceFactory.make();
  const nfeioService = new NFEIOService();
  return new DbCreateRequest(
    requestRepository,
    companyRepository,
    userRepository,
    emailService,
    nfeioService
  );
}

export function makeListRequestsUseCase() {
  const requestRepository = new PrismaRequestRepository();
  return new DbListRequests(requestRepository);
}

export function makeGetRequestByIdUseCase() {
  const requestRepository = new PrismaRequestRepository();
  return new DbGetRequestById(requestRepository);
}

export function makeUpdateRequestStatusUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const userRepository = new PrismaUserRepository();
  const companyRepository = new PrismaCompanyRepository();
  const emailService = EmailServiceFactory.make();
  return new DbUpdateRequestStatus(requestRepository, userRepository, companyRepository, emailService);
}

export function makeCancelRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  return new DbCancelRequest(requestRepository);
}

export function makeEmitInvoiceUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const companyRepository = new PrismaCompanyRepository();
  const userRepository = new PrismaUserRepository();
  const nfeioService = new NFEIOService();
  const emailService = EmailServiceFactory.make();
  return new DbEmitInvoice(
    requestRepository,
    companyRepository,
    userRepository,
    nfeioService,
    emailService
  );
}
