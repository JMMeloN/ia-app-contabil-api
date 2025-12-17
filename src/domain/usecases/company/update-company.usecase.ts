import { CompanyModel } from '@/domain/models/company.model';

export interface UpdateCompanyDTO {
  id: string;
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  userId: string; // Para validar propriedade
}

export interface UpdateCompanyUseCase {
  execute(data: UpdateCompanyDTO): Promise<CompanyModel>;
}
