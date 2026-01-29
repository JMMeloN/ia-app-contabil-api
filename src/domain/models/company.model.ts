export interface CompanyModel {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  userId: string;
  nfeioCompanyId?: string | null;
  cityServiceCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
