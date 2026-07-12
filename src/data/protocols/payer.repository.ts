export interface PayerModel {
  id: string;
  name: string;
  document: string;
  type: 'LEGAL_ENTITY' | 'NATURAL_PERSON';
  email?: string | null;
  phone?: string | null;
  endereco?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  cidade?: string | null;
  codigoCidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  companyId: string;
  userId: string;
  nfeioPayerId?: string | null;
  syncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePayerData {
  name: string;
  document: string;
  type?: 'LEGAL_ENTITY' | 'NATURAL_PERSON';
  email?: string;
  phone?: string;
  endereco?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  codigoCidade?: string;
  estado?: string;
  cep?: string;
  companyId: string;
  userId: string;
}

export interface UpdatePayerData {
  name?: string;
  document?: string;
  type?: 'LEGAL_ENTITY' | 'NATURAL_PERSON';
  email?: string;
  phone?: string;
  endereco?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  codigoCidade?: string;
  estado?: string;
  cep?: string;
  nfeioPayerId?: string;
  syncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface PayerRepository {
  create(data: CreatePayerData): Promise<PayerModel>;
  findById(id: string): Promise<PayerModel | null>;
  findByUserId(userId: string): Promise<PayerModel[]>;
  findByCompanyId(companyId: string): Promise<PayerModel[]>;
  findByCompanyIdAndDocument(companyId: string, document: string): Promise<PayerModel | null>;
  update(id: string, data: UpdatePayerData): Promise<PayerModel>;
  delete(id: string): Promise<void>;
}
