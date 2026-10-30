import { CompanyModel } from '@/domain/models/company.model';

export interface SyncCompanyDTO {
  id: string;
  userId: string;
}

export interface SyncCompanyUseCase {
  execute(data: SyncCompanyDTO): Promise<CompanyModel>;
}
