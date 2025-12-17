import { CompanyModel } from '@/domain/models/company.model';

export interface ListCompaniesUseCase {
  execute(userId: string): Promise<CompanyModel[]>;
}
