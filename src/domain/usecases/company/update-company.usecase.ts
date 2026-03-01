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
  userId: string;
  // Campos opcionais para integração NFe.io
  cityServiceCode?: string;
  taxRegime?: string;
  legalNature?: string;
}

export interface UpdateCompanyUseCase {
  execute(data: UpdateCompanyDTO): Promise<CompanyModel>;
}
