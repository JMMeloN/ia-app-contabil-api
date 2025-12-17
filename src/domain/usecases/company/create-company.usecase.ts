import { CompanyModel } from '@/domain/models/company.model';

export interface CreateCompanyDTO {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  userId: string;
}

export interface CreateCompanyUseCase {
  execute(data: CreateCompanyDTO): Promise<CompanyModel>;
}
