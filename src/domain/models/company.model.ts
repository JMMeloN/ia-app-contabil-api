export interface CompanyModel {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string | null;
  endereco?: string | null;
  cidade: string;
  estado: string;
  cep: string;
  codigoCidade?: string | null;
  userId: string;
  nfeioCompanyId?: string | null;
  cityServiceCode?: string | null;
  syncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}
