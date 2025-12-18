import { CompanyModel } from '@/domain/models/company.model';

export interface CreateCompanyData {
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

export interface UpdateCompanyData {
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface CompanyRepository {
  create(data: CreateCompanyData): Promise<CompanyModel>;
  findByUserId(userId: string): Promise<CompanyModel[]>;
  findById(id: string): Promise<CompanyModel | null>;
  findByUserIdAndCnpj(userId: string, cnpj: string): Promise<CompanyModel | null>;
  update(id: string, data: UpdateCompanyData): Promise<CompanyModel>;
  delete(id: string): Promise<void>;
}
